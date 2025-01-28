import os
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter

db = SQLAlchemy()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
token_blocklist=set()

class Config:
    # App Configuration
    PORT=5000
    TESTING=False
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    
    # Security
    JWT_COOKIE_SECURE = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    
    # Email
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.example.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    
    CACHE_TTL = int(os.getenv('CACHE_TTL', 300))  # 5 minutes
    RATE_LIMIT = "100 per minute"
    ALLOWED_PERIODS = {'1d', '5d', '1mo', '6mo', '1y', 'ytd'}
    VALID_SYMBOLS = {
        'stocks': {'AAPL', 'MSFT', '2222.SR', 'CDI.PA', 'GOOGL', 'NVDA'},
        'crypto': {'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'DOGE-USD'}
    }
    
    # File Uploads
    UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # 2MB

class TestingConfig(Config):
    # App 
    TESTING=True