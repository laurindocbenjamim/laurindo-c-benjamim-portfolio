
import os

class Config:
    UPLOAD_VIDEO_FOLDER='video_uploads'
    UPLOAD_DOCS_FOLDER='doc_uploads'
    MAX_CONTENT_LENGTH=16 * 1024 * 1024 # 16 MB limit for file uploads
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.csv', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.mp3', '.mp4', '.webm', '.mkv', '.avi'}
    UPLOAD_EXTENSION_DOCS_ALLOWED = ['.pdf', '.docx', '.csv', '.txt']
    UPLOAD_EXTENSIONS_IMAGE_ALLOWED = ['.jpg','.jpeg', '.png', '.gif']
    UPLOAD_EXTENSIONS_VIDEO_ALLOWED = ['.mp4', '.mkv', '.wave']
    #@property
    #def UPLOAD_VIDEO_FOLDER(self): return 'video_uploads'

    #
    @property
    def SECRETE_KEY(self): return 'XVnI^ls~%vZD4"Q5Fz?Gj)zKJ=3#N,(@'
    

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
    
    

