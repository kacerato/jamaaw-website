import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'jamaaw-secret-key-2025'
    
    # PostgreSQL Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'postgresql://neondb_owner:npg_VWD1jLbX4KUG@ep-round-rice-ac575c2x-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jamaaw-jwt-secret-2025'
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 24 * 7  # 7 days
    
    # CORS Configuration
    CORS_ORIGINS = ["*"]  # Allow all origins for development
    
    # Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

