import os
from datetime import timedelta

class Config:
    SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'XVnI^ls~%vZD4"Q5Fz?Gj)zKJ=3#N,(@')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    

    UPLOAD_VIDEO_FOLDER= 'video_uploads'
    UPLOAD_DOCS_FOLDER= 'doc_uploads'
    DECRYPTED_FOLDER = 'decrypted'
    MODIFIED_FOLDER = 'modified'
    
    MAX_CONTENT_LENGTH=50 * 1024 * 1024 # 16 MB limit for file uploads
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.csv', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.mp3', '.mp4', '.webm', '.mkv', '.avi'}
    UPLOAD_EXTENSION_DOCS_ALLOWED = ['.pdf', '.docx', '.csv', '.txt']
    UPLOAD_EXTENSIONS_IMAGE_ALLOWED = ['.jpg','.jpeg', '.png', '.gif']
    UPLOAD_EXTENSIONS_VIDEO_ALLOWED = ['.mp4', '.mkv', '.wave']
    #@property
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'GvkxD-8YsYKKpwZOODi9pBKtm3wr_0TP5enjETS6ZC8')
 
    # JWT Configuration
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_ACCESS_COOKIE_NAME = 'access_token'
    JWT_REFRESH_COOKIE_NAME = 'refresh_token'
    JWT_COOKIE_SECURE = False  # True in production
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_CSRF_CHECK_FORM = False  # Disable for API testing
    JWT_CSRF_IN_COOKIES = True
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:52330"
    ]
    CORS_SUPPORTS_CREDENTIALS = True
    
    # Rate Limiting
    RATELIMIT_DEFAULT = "200 per day;50 per hour"


class TestingConfig(Config):
        
    def __init__(self):
        super().__init__()
    
    #
    @property
    def TESTING(self): return True

    #
    @property
    def PORT(self): return True

    #
    @property
    def DEBUG(self): return True
    