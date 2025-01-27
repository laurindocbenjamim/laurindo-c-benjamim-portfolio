import secrets
import string, os
from flask import Flask, send_file, jsonify, request
from flask_restful import Api, Resource
from api.dependencies import ProxyFix, CORS, cross_origin
from flask_wtf import CSRFProtect
from api.config import TestingConfig
from api.video.video_resource import VideoResource
from api.upload_factory.upload_controller import FileUploadResource
from api.upload_factory.upload_multiple_controller import FilesUploadResource
from api.api_blueprint import bp as bp_api, api_endpoints
from api.endpoint_resources import load_restfull_endpoints
from api.utils.cors_police import allowed_domains_to_api_route
from api.utils.cors_police import allowed_domains_to_upload_route
from api.utils.cors_police import allowed_domains_to_files_route
from api.utils.error_handles import handle_errors
from api.config import csrf
from PyPDF2 import PdfReader, PdfWriter
from api.upload_factory.file_upload import save_uploaded_file  # Import the file upload module

app = Flask(__name__,instance_relative_config=True,static_folder='static')
api = Api(app)
csrf_global=None

"""
You can modify the origins list to include the domains you wish to allow. 
If you want to allow multiple paths or endpoints with different origins, 
you can configure resources accordingly:

"""
cors = CORS(app, resources={
    r"/videos/post": {"origins": allowed_domains_to_upload_route()},
    r"/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/csrf-token/get": {"origins": allowed_domains_to_upload_route()},
    r"/api/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/files-storage": {"origins": allowed_domains_to_files_route()},
    r"/api/*": {"origins": allowed_domains_to_api_route()},
})
## Enable CORS for specific domains 
# Enable CORS for all domains on all routes
"""error ccess to fetch at 'http://127.0.0.1:5000/API/upload' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled"""
#CORS(app)


def generate_strong_secret_key(length=32): 
    
    alphabet = string.ascii_letters + string.digits + string.punctuation 
    return ''.join(secrets.choice(alphabet) for _ in range(length))


#
def remove_pdf_protection(input_path, output_path, password):
    reader = PdfReader(input_path)
    if reader.is_encrypted:
        reader.decrypt(password)

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    with open(output_path, 'wb') as output_pdf:
        writer.write(output_pdf)


#
def remove_edit_protection(input_path, output_path):
    """Remove edit restrictions from a PDF."""
    reader = PdfReader(input_path)
    writer = PdfWriter()

    # Copy all pages to a new PDF
    for page in reader.pages:
        writer.add_page(page)

    # Remove permissions (create an unrestricted PDF)
    writer.add_metadata(reader.metadata)  # Copy metadata if needed
    writer.write(output_path)

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

    # Create directories
    os.makedirs(os.path.join(app.root_path, 'static', app.config['UPLOAD_VIDEO_FOLDER']), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', app.config['UPLOAD_DOCS_FOLDER']), exist_ok=True)
    #os.makedirs(os.path.join(app.root_path, 'static', app.config['DECRYPTED_FOLDER']), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', app.config['MODIFIED_FOLDER']), exist_ok=True)

    # Apply security middlewares 
    app.wsgi_app = ProxyFix(app.wsgi_app)

    #csrf = CSRFProtect(app=app)
    csrf.init_app(app=app)
       
    # Load the API endpoints
    app.register_blueprint(bp_api)
    api_endpoints(csrf)
    #load_restfull_endpoints(api)
    #
    handle_errors(app=app)

    #
    @app.route('/videos')
    def get_video():
        video_path = 'assets/video/AI_Agents_And_Agentic_Reasoning.mp4'
        return send_file(video_path, mimetype='video/mp4')


    @app.route('/videos/post', methods=['GET','POST'])
    @cross_origin(methods=['GET','POST'])
    @csrf.exempt
    def video_post():
       # Check if the request contains the file part
        if 'videoFileToAnalyze' not in request.files:
            return jsonify({"status":400, "error": "No video file to analyze has been found!"})

        file = request.files['videoFileToAnalyze']
        
        # Check if a file has been selected
        if file.filename == '':
            return jsonify({"status":400, "error": "No selected file"})

        # Use the save_uploaded_file function from the module
        file_directory=os.path.join(app.root_path, 'static', app.config['UPLOAD_VIDEO_FOLDER'])
        status,result = save_uploaded_file(file, file_directory)
        if not status:
            return jsonify({"status": 400, "error": f"Error: {result}"})
        return jsonify(result)

    @app.route('/pdf-unlock/remove-protecction', methods=['POST'])
    @cross_origin(methods=['POST'])
    @csrf.exempt
    def pdf_pdf_protection():

        if 'file' not in request.files:
            return "No file part", 400
        file = request.files['file']
        password = request.form.get('password', '')

        if file.filename == '':
            return "No selected file", 400

        filepath = os.path.join(f'static/{app.config['UPLOAD_DOCS_FOLDER']}', file.filename)
        file.save(filepath)

        try: #app.root_path, 'static', app.config['MODIFIED_FOLDER']
            # Attempt to remove protection
            decrypted_file = os.path.join(f'static/{app.config['DECRYPTED_FOLDER']}', f"decrypted_{file.filename}")
            remove_pdf_protection(filepath, decrypted_file, password)
            return send_file(decrypted_file, as_attachment=True)
        except Exception as e:
            return f"Error: {e}", 500
        finally:
            # Cleanup
            if os.path.exists(filepath):
                os.remove(filepath)

    @app.route('/pdf-unlock/modify-permition', methods=['POST'])
    @cross_origin(methods=['POST'])
    @csrf.exempt
    def pdf_modify_permitions():
        if 'file' not in request.files:
            return "No file part", 400

        file = request.files['file']
        if file.filename == '':
            return "No selected file", 400

        # Get the file size
        file_size = file.content_length / (1024 * 1024)  # Size in MB
        if file_size > 20:
            return f"File size must be less or equals 20MB. (Your file have {file_size}MB)"
        #app.root_path, 'static', app.config['MODIFIED_FOLDER']
        filepath = os.path.join(app.root_path, 'static', app.config['UPLOAD_DOCS_FOLDER'], file.filename)
        file.save(filepath)

        try:
            # Process the file to remove edit protection
            modified_file = os.path.join(app.root_path, 'static', app.config['MODIFIED_FOLDER'], f"unrestricted_{file.filename}")
            remove_edit_protection(filepath, modified_file)
            # Send the file as a binary download
            return send_file(modified_file, as_attachment=True, download_name=f"unrestricted_{file.filename}")
        except Exception as e:
            return f"Error: {e}", 500
        finally:
            # Cleanup
            if os.path.exists(filepath):
                os.remove(filepath)

    @app.route('/secrete-key')
    def sercrete_key():
        
        return f"Secrete-key: {generate_strong_secret_key()}"

    #
    return app
