
import os

class Config:
    UPLOAD_VIDEO_FOLDER='video_uploads'
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
    
    

