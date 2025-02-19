
import os

class Config:

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
    #def UPLOAD_VIDEO_FOLDER(self): return 'video_uploads'
    SECRET_KEY='Nlc0cf9D3bqRxI5SDPajVkiEymrcrOmaOld1nl5Nlk1iH8asrJBknpLJ0pItCB7D8zJ59ikcbEn7RdsiUVjHdw'
    #
    # JWT Configuration
    JWT_SECRET_KEY =SECRET_KEY# os.getenv('JWT_SECRET_KEY', 'GvkxD-8YsYKKpwZOODi9pBKtm3wr_0TP5enjETS6ZC8')
    JWT_ALGORITHM = "HS256"
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:52330"
    ]
    CORS_SUPPORTS_CREDENTIALS = True

#
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
    
    

