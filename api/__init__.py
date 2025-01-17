import secrets
import string
from flask import Flask, send_file
from flask_restful import Api, Resource
from api.dependencies import ProxyFix, CORS
from api.config import TestingConfig
from api.video.video_resource import VideoResource
from api.upload_factory.upload_controller import FileUploadResource
from api.utils.cors_police import allowed_domains_to_api_route
from api.utils.cors_police import allowed_domains_to_upload_route
from api.utils.cors_police import allowed_domains_to_files_route



app = Flask(__name__,instance_relative_config=True,static_folder='static')
api = Api(app)
"""
You can modify the origins list to include the domains you wish to allow. 
If you want to allow multiple paths or endpoints with different origins, 
you can configure resources accordingly:

"""
cors = CORS(app, resources={
    r"/upload": {"origins": allowed_domains_to_upload_route()},
    r"/API/upload": {"origins": allowed_domains_to_upload_route()},
    r"/API/files": {"origins": allowed_domains_to_files_route()},
    r"/API/*": {"origins": allowed_domains_to_api_route()},
})
## Enable CORS for specific domains 
# Enable CORS for all domains on all routes
"""error ccess to fetch at 'http://127.0.0.1:5000/API/upload' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled"""
#CORS(app)
# Apply security middlewares 
app.wsgi_app = ProxyFix(app.wsgi_app)

def generate_strong_secret_key(length=32): 
    alphabet = string.ascii_letters + string.digits + string.punctuation 
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_app():

    
    #api = Api(app)

    """
    These options can be added to a Set-Cookie header to improve their security. Flask has 
    configuration options to set these on the session cookie. 
    They can be set on other cookies too.
    """
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        #PERMANENT_SESSION_LIFETIME=600,
    )

    app.config.from_object(TestingConfig)

    #API  
    api.add_resource(VideoResource, '/video/get/<string:filename>')

    # Add resource endpoints 
    api.add_resource(FileUploadResource, '/API/upload')

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
