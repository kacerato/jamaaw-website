from flask import Blueprint, request, jsonify, session
import bcrypt
from src.models.auth import AuthModel
from src.config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login com email e senha"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Buscar usuário por email
        user = AuthModel.get_user_by_email(email)
        if not user:
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Verificar senha
        if not user['password_hash'] or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Verificar se é administrador
        if not AuthModel.is_admin(str(user['id'])):
            return jsonify({'error': 'Usuário não autorizado'}), 403
        
        # Gerar token JWT
        token = AuthModel.generate_token(user)
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['id']),
                'email': user['email'],
                'name': user['name'],
                'is_admin': True
            }
        })
        
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verifica um token JWT"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 400
        
        payload = AuthModel.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Buscar dados atualizados do usuário
        user = AuthModel.get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Verificar se ainda é admin
        is_admin = AuthModel.is_admin(payload['user_id'])
        if not is_admin:
            return jsonify({'error': 'Usuário não é mais administrador'}), 403
        
        return jsonify({
            'valid': True,
            'user': {
                'id': str(user['id']),
                'email': user['email'],
                'name': user['name'],
                'is_admin': is_admin
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout do usuário"""
    session.clear()
    return jsonify({'message': 'Logout realizado com sucesso'})

@auth_bp.route('/user', methods=['GET'])
def get_current_user():
    """Retorna dados do usuário atual"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = AuthModel.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        user = AuthModel.get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'id': str(user['id']),
            'email': user['email'],
            'name': user['name'],
            'is_admin': AuthModel.is_admin(payload['user_id'])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Altera a senha do usuário"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = AuthModel.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400
        
        # Buscar usuário
        user = AuthModel.get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Verificar senha atual
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Senha atual incorreta'}), 400
        
        # Atualizar senha
        if AuthModel.update_password(payload['user_id'], new_password):
            return jsonify({'message': 'Senha alterada com sucesso'})
        else:
            return jsonify({'error': 'Erro ao alterar senha'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

