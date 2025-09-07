from flask import Blueprint, request, jsonify
import os
import zipfile
import xml.etree.ElementTree as ET
from werkzeug.utils import secure_filename
import uuid
from src.models.auth import AuthModel
from src.models.kmz import KmzModel
from src.config import Config

kmz_bp = Blueprint('kmz', __name__)

def require_auth(f):
    """Decorator para verificar autenticação"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = AuthModel.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        if not AuthModel.is_admin(payload['user_id']):
            return jsonify({'error': 'Acesso negado'}), 403
        
        request.current_user = payload
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

def allowed_file(filename):
    """Verifica se o arquivo é um KMZ válido"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'kmz'

def extract_coordinates_from_kml(kml_content):
    """Extrai coordenadas de um arquivo KML"""
    coordinates = []
    
    try:
        # Parse do XML
        root = ET.fromstring(kml_content)
        
        # Namespace do KML
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Buscar por placemarks
        placemarks = root.findall('.//kml:Placemark', ns)
        
        for placemark in placemarks:
            name_elem = placemark.find('kml:name', ns)
            name = name_elem.text if name_elem is not None else 'Sem nome'
            
            description_elem = placemark.find('kml:description', ns)
            description = description_elem.text if description_elem is not None else ''
            
            # Buscar coordenadas em Point
            point = placemark.find('.//kml:Point/kml:coordinates', ns)
            if point is not None:
                coords_text = point.text.strip()
                if coords_text:
                    # Formato: longitude,latitude,altitude
                    coords_parts = coords_text.split(',')
                    if len(coords_parts) >= 2:
                        try:
                            longitude = float(coords_parts[0])
                            latitude = float(coords_parts[1])
                            coordinates.append({
                                'latitude': latitude,
                                'longitude': longitude,
                                'name': name,
                                'description': description
                            })
                        except ValueError:
                            continue
            
            # Buscar coordenadas em LineString
            linestring = placemark.find('.//kml:LineString/kml:coordinates', ns)
            if linestring is not None:
                coords_text = linestring.text.strip()
                if coords_text:
                    # Múltiplas coordenadas separadas por espaço ou quebra de linha
                    coord_pairs = coords_text.replace('\n', ' ').split()
                    for coord_pair in coord_pairs:
                        coords_parts = coord_pair.split(',')
                        if len(coords_parts) >= 2:
                            try:
                                longitude = float(coords_parts[0])
                                latitude = float(coords_parts[1])
                                coordinates.append({
                                    'latitude': latitude,
                                    'longitude': longitude,
                                    'name': f"{name} (Linha)",
                                    'description': description
                                })
                            except ValueError:
                                continue
    
    except Exception as e:
        print(f"Erro ao extrair coordenadas: {e}")
    
    return coordinates

@kmz_bp.route('/upload', methods=['POST'])
@require_auth
def upload_kmz():
    """Upload de arquivo KMZ"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos KMZ são permitidos'}), 400
        
        # Gerar nome único para o arquivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
        
        # Salvar arquivo
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Criar registro no banco
        kmz_file = KmzModel.create_kmz_file(
            filename=unique_filename,
            original_name=filename,
            file_size=file_size,
            storage_path=file_path
        )
        
        if not kmz_file:
            os.remove(file_path)  # Remover arquivo se falhou ao criar registro
            return jsonify({'error': 'Erro ao salvar arquivo no banco'}), 500
        
        # Processar arquivo KMZ
        coordinates = []
        try:
            with zipfile.ZipFile(file_path, 'r') as kmz:
                # Procurar por arquivos KML dentro do KMZ
                for file_info in kmz.filelist:
                    if file_info.filename.lower().endswith('.kml'):
                        with kmz.open(file_info.filename) as kml_file:
                            kml_content = kml_file.read().decode('utf-8')
                            file_coordinates = extract_coordinates_from_kml(kml_content)
                            coordinates.extend(file_coordinates)
            
            # Salvar coordenadas no banco
            saved_coordinates = []
            for coord in coordinates:
                saved_coord = KmzModel.create_coordinate(
                    file_id=kmz_file['id'],
                    latitude=coord['latitude'],
                    longitude=coord['longitude'],
                    name=coord['name'],
                    description=coord['description']
                )
                if saved_coord:
                    saved_coordinates.append(saved_coord)
            
            # Marcar arquivo como processado
            KmzModel.mark_as_processed(kmz_file['id'])
            
            return jsonify({
                'message': 'Arquivo KMZ processado com sucesso',
                'file': kmz_file,
                'coordinates_count': len(saved_coordinates),
                'coordinates': saved_coordinates
            })
        
        except Exception as e:
            print(f"Erro ao processar KMZ: {e}")
            return jsonify({
                'message': 'Arquivo salvo, mas houve erro no processamento',
                'file': kmz_file,
                'error': str(e)
            }), 206
    
    except Exception as e:
        print(f"Erro no upload: {e}")
        return jsonify({'error': str(e)}), 500

@kmz_bp.route('/files', methods=['GET'])
@require_auth
def get_kmz_files():
    """Lista todos os arquivos KMZ"""
    try:
        files = KmzModel.get_all_kmz_files()
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kmz_bp.route('/files/<int:file_id>', methods=['GET'])
@require_auth
def get_kmz_file(file_id):
    """Busca um arquivo KMZ específico"""
    try:
        file = KmzModel.get_kmz_file(file_id)
        if not file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        coordinates = KmzModel.get_coordinates_by_file(file_id)
        
        return jsonify({
            'file': file,
            'coordinates': coordinates
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kmz_bp.route('/files/<int:file_id>', methods=['DELETE'])
@require_auth
def delete_kmz_file(file_id):
    """Deleta um arquivo KMZ e suas coordenadas"""
    try:
        # Buscar arquivo para obter o caminho
        file = KmzModel.get_kmz_file(file_id)
        if not file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        # Deletar arquivo físico
        if os.path.exists(file['storage_path']):
            os.remove(file['storage_path'])
        
        # Deletar do banco
        if KmzModel.delete_kmz_file(file_id):
            return jsonify({'message': 'Arquivo deletado com sucesso'})
        else:
            return jsonify({'error': 'Erro ao deletar arquivo do banco'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kmz_bp.route('/coordinates', methods=['GET'])
def get_all_coordinates():
    """Busca todas as coordenadas (endpoint público para o mapa)"""
    try:
        coordinates = KmzModel.get_all_coordinates()
        return jsonify({'coordinates': coordinates})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kmz_bp.route('/stats', methods=['GET'])
@require_auth
def get_kmz_stats():
    """Retorna estatísticas dos arquivos KMZ"""
    try:
        stats = KmzModel.get_kmz_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

