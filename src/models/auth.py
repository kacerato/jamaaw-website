import jwt
import datetime
import bcrypt
from typing import Optional, Dict, Any
from src.database import db
from src.config import Config

class AuthModel:
    @staticmethod
    def hash_password(password: str) -> str:
        """Gera hash da senha"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def create_user(email: str, name: str, password: str = None) -> Optional[Dict[str, Any]]:
        """Cria um novo usuário"""
        password_hash = AuthModel.hash_password(password) if password else None
        
        query = """
            INSERT INTO users (email, name, password_hash)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, email, name, created_at
        """
        return db.execute_query_one(query, (email, name, password_hash))
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Busca usuário por email"""
        query = "SELECT * FROM users WHERE email = %s"
        return db.execute_query_one(query, (email,))
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Busca usuário por ID"""
        query = "SELECT * FROM users WHERE id = %s"
        return db.execute_query_one(query, (user_id,))
    
    @staticmethod
    def update_password(user_id: str, new_password: str) -> bool:
        """Atualiza a senha do usuário"""
        try:
            password_hash = AuthModel.hash_password(new_password)
            query = "UPDATE users SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            db.execute_query(query, (password_hash, user_id))
            return True
        except Exception as e:
            print(f"Erro ao atualizar senha: {e}")
            return False
    
    @staticmethod
    def is_admin(user_id: str) -> bool:
        """Verifica se o usuário é administrador"""
        query = "SELECT COUNT(*) as count FROM admin_users WHERE user_id = %s AND is_active = true"
        result = db.execute_query_one(query, (user_id,))
        return result['count'] > 0 if result else False
    
    @staticmethod
    def is_admin_by_email(email: str) -> bool:
        """Verifica se o usuário é administrador pelo email"""
        query = """
            SELECT COUNT(*) as count 
            FROM admin_users au 
            JOIN users u ON au.user_id = u.id 
            WHERE u.email = %s AND au.is_active = true
        """
        result = db.execute_query_one(query, (email,))
        return result['count'] > 0 if result else False
    
    @staticmethod
    def get_admin_user(user_id: str) -> Optional[Dict[str, Any]]:
        """Busca dados do administrador"""
        query = """
            SELECT au.*, u.email, u.name
            FROM admin_users au
            JOIN users u ON au.user_id = u.id
            WHERE au.user_id = %s AND au.is_active = true
        """
        return db.execute_query_one(query, (user_id,))
    
    @staticmethod
    def create_admin_user(user_id: str, is_super_admin: bool = False) -> bool:
        """Cria um registro de administrador"""
        try:
            query = """
                INSERT INTO admin_users (user_id, is_active, is_super_admin)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE SET
                    is_active = EXCLUDED.is_active,
                    is_super_admin = EXCLUDED.is_super_admin,
                    updated_at = CURRENT_TIMESTAMP
            """
            db.execute_query(query, (user_id, True, is_super_admin))
            return True
        except Exception as e:
            print(f"Erro ao criar admin: {e}")
            return False
    
    @staticmethod
    def generate_token(user_data: Dict[str, Any]) -> str:
        """Gera um token JWT para o usuário"""
        payload = {
            'user_id': str(user_data['id']),
            'email': user_data['email'],
            'name': user_data.get('name', ''),
            'is_admin': AuthModel.is_admin(str(user_data['id'])),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verifica e decodifica um token JWT"""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

