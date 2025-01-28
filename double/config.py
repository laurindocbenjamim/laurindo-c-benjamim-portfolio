import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    UPLOAD_FOLDER = 'app/static/uploads'
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # Max file size: 50MB
