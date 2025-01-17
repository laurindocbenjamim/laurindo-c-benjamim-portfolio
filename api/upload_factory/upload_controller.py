from api.dependencies import os, uuid
from api.dependencies import request, current_app
from api.dependencies import jsonify
from api.dependencies import Resource
from api.dependencies import secure_filename
from api.utils.validators import validate_file

class FileUploadResource(Resource):
    def post(self):
        if 'cvUpload' not in request.files:
            return jsonify({"error": "No file part"})
        
        file = request.files['cvUpload']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"})
        
        # Define the upload directory path 
        upload_dir = os.path.join(os.getcwd(), current_app.config['UPLOAD_DOCS_FOLDER']) 
        # Create the directory if it does not exist 
        if not os.path.exists(upload_dir): 
            os.makedirs(upload_dir, mode=0o755) # Read and execute permissions

        if file and validate_file(file, current_app.config['UPLOAD_EXTENSION_DOCS_ALLOWED']):
            # Generate a unique filename using UUID 
            unique_filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1] 
            filename = secure_filename(unique_filename)
        
            file.save(os.path.join('uploads', filename))
            return jsonify({"message": "File successfully uploaded."})
        else:
            return jsonify({"error": f"Invalid file {current_app.config['UPLOAD_DOCS_FOLDER']}"})
            
    def get(self):
        return jsonify({"message": "Send a POST request to upload a file."})
