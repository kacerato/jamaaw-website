from typing import Optional, Dict, Any, List
from src.database import db

class KmzModel:
    @staticmethod
    def create_kmz_file(filename: str, original_name: str, file_size: int, storage_path: str) -> Optional[Dict[str, Any]]:
        """Cria um registro de arquivo KMZ"""
        query = """
            INSERT INTO kmz_files (filename, original_name, file_size, storage_path, processed)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, filename, original_name, file_size, storage_path, uploaded_at, processed, created_at
        """
        return db.execute_query_one(query, (filename, original_name, file_size, storage_path, False))
    
    @staticmethod
    def get_kmz_file(file_id: int) -> Optional[Dict[str, Any]]:
        """Busca um arquivo KMZ por ID"""
        query = "SELECT * FROM kmz_files WHERE id = %s"
        return db.execute_query_one(query, (file_id,))
    
    @staticmethod
    def get_all_kmz_files() -> List[Dict[str, Any]]:
        """Busca todos os arquivos KMZ"""
        query = "SELECT * FROM kmz_files ORDER BY uploaded_at DESC"
        return db.execute_query(query, fetch=True)
    
    @staticmethod
    def mark_as_processed(file_id: int) -> bool:
        """Marca um arquivo KMZ como processado"""
        try:
            query = """
                UPDATE kmz_files 
                SET processed = true, processed_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            """
            db.execute_query(query, (file_id,))
            return True
        except Exception as e:
            print(f"Erro ao marcar como processado: {e}")
            return False
    
    @staticmethod
    def delete_kmz_file(file_id: int) -> bool:
        """Deleta um arquivo KMZ e suas coordenadas"""
        try:
            # Primeiro deletar as coordenadas
            db.execute_query("DELETE FROM kmz_coordinates WHERE kmz_file_id = %s", (file_id,))
            # Depois deletar o arquivo
            db.execute_query("DELETE FROM kmz_files WHERE id = %s", (file_id,))
            return True
        except Exception as e:
            print(f"Erro ao deletar arquivo KMZ: {e}")
            return False
    
    @staticmethod
    def create_coordinate(file_id: int, latitude: float, longitude: float, name: str = None, description: str = None) -> Optional[Dict[str, Any]]:
        """Cria uma coordenada extraída de um arquivo KMZ"""
        query = """
            INSERT INTO kmz_coordinates (kmz_file_id, latitude, longitude, name, description)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, kmz_file_id, latitude, longitude, name, description, created_at
        """
        return db.execute_query_one(query, (file_id, latitude, longitude, name, description))
    
    @staticmethod
    def get_coordinates_by_file(file_id: int) -> List[Dict[str, Any]]:
        """Busca todas as coordenadas de um arquivo KMZ"""
        query = "SELECT * FROM kmz_coordinates WHERE kmz_file_id = %s ORDER BY created_at"
        return db.execute_query(query, (file_id,), fetch=True)
    
    @staticmethod
    def get_all_coordinates() -> List[Dict[str, Any]]:
        """Busca todas as coordenadas de todos os arquivos KMZ"""
        query = """
            SELECT kc.*, kf.filename, kf.original_name
            FROM kmz_coordinates kc
            JOIN kmz_files kf ON kc.kmz_file_id = kf.id
            ORDER BY kc.created_at DESC
        """
        return db.execute_query(query, fetch=True)
    
    @staticmethod
    def delete_coordinates_by_file(file_id: int) -> bool:
        """Deleta todas as coordenadas de um arquivo KMZ"""
        try:
            db.execute_query("DELETE FROM kmz_coordinates WHERE kmz_file_id = %s", (file_id,))
            return True
        except Exception as e:
            print(f"Erro ao deletar coordenadas: {e}")
            return False
    
    @staticmethod
    def get_kmz_stats() -> Dict[str, Any]:
        """Retorna estatísticas dos arquivos KMZ"""
        try:
            # Total de arquivos
            files_query = "SELECT COUNT(*) as count FROM kmz_files"
            files_result = db.execute_query_one(files_query)
            total_files = files_result['count'] if files_result else 0
            
            # Total de coordenadas
            coords_query = "SELECT COUNT(*) as count FROM kmz_coordinates"
            coords_result = db.execute_query_one(coords_query)
            total_coordinates = coords_result['count'] if coords_result else 0
            
            # Arquivos processados
            processed_query = "SELECT COUNT(*) as count FROM kmz_files WHERE processed = true"
            processed_result = db.execute_query_one(processed_query)
            processed_files = processed_result['count'] if processed_result else 0
            
            return {
                'total_files': total_files,
                'total_coordinates': total_coordinates,
                'processed_files': processed_files,
                'pending_files': total_files - processed_files
            }
        except Exception as e:
            print(f"Erro ao buscar estatísticas: {e}")
            return {
                'total_files': 0,
                'total_coordinates': 0,
                'processed_files': 0,
                'pending_files': 0
            }

