import secrets
import string
from flask import Flask, send_file
from flask_restful import Api, Resource
from api.config import TestingConfig
from api.video.video_resource import VideoResource



app = Flask(__name__,static_folder='static')
api = Api(app)


def generate_strong_secret_key(length=32): 
    alphabet = string.ascii_letters + string.digits + string.punctuation 
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_app():

    app.config.from_object(TestingConfig)

    #API  
    api.add_resource(VideoResource, '/video/get/<string:filename>')

    #
    @app.route('/videos')
    def get_video():
        video_path = 'assets/video/AI_Agents_And_Agentic_Reasoning.mp4'
        return send_file(video_path, mimetype='video/mp4')

    @app.route('/secrete-key')
    def sercrete_key():
        
        return f"Secrete-key: {generate_strong_secret_key()}"

    #
    return app
