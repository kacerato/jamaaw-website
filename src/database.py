import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from src.config import Config

class Database:
    def __init__(self):
        self.connection_string = Config.DATABASE_URL
    
    @contextmanager
    def get_connection(self):
        """Context manager para conexões com o banco de dados"""
        conn = None
        try:
            conn = psycopg2.connect(
                self.connection_string,
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query, params=None, fetch=False):
        """Executa uma query no banco de dados"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            if fetch:
                result = cursor.fetchall()
                conn.commit()
                return result
            else:
                conn.commit()
                return cursor.rowcount
    
    def execute_query_one(self, query, params=None):
        """Executa uma query e retorna apenas um resultado"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            result = cursor.fetchone()
            conn.commit()
            return result

# Instância global do banco de dados
db = Database()

