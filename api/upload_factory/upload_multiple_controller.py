from api.dependencies import os, uuid
from api.dependencies import request, current_app
from api.dependencies import jsonify
from api.dependencies import Resource
from api.dependencies import secure_filename
from api.utils.validators import validate_file

import os
import uuid
from flask import request, jsonify, current_app
from flask_restful import Resource
from werkzeug.utils import secure_filename
from utils.validators import validate_file

class FileUploadResource(Resource):
    def post(self):
        """ 
        Handle POST requests to upload files. 
        This method checks for files in the request, validates them, 
        and uploads them to the specified directory.
        """
        if 'cvUpload' not in request.files:
            return jsonify({"error": "No file part"})
        
        files = request.files.getlist('cvUpload')
        
        if len(files) == 0 or (len(files) == 1 and files[0].filename == ''):
            return jsonify({"error": "No selected file"})
        
        uploaded_files, error = self.handle_file_uploads(files)
        
        if error:
            return jsonify({"error": error})
        
        return jsonify({"message": "Files successfully uploaded.", "files": uploaded_files})
            
    def get(self):
        """
        Handle GET requests.
        This method returns a message indicating that a POST request should be used to upload files.
        """
        return jsonify({"message": "Send a POST request to upload a file."})
    
    def handle_file_uploads(self, files):
        """
        Handle the file upload process.
        
        Parameters:
        files (list): List of file objects to be uploaded
        
        Returns:
        tuple: List of uploaded file names and an error message if any
        """
        # Define the upload directory path within the Flask static folder
        static_dir = os.path.join(current_app.root_path, 'static')
        upload_dir = os.path.join(static_dir, current_app.config['UPLOAD_DOCS_FOLDER'])

        # Create the directory if it does not exist
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir, mode=0o755)  # Read and execute permissions

        uploaded_files = []
        error = None

        for file in files:
            if file and validate_file(file, current_app.config['ALLOWED_EXTENSIONS']):
                unique_filename = self.generate_unique_filename(file)
                filename = secure_filename(unique_filename)
                file.save(os.path.join(upload_dir, filename))
                uploaded_files.append(filename)
            else:
                error = f"Invalid file format!: {file.filename}"
                break

        return uploaded_files, error
    
    def generate_unique_filename(self, file):
        """
        Generate a unique filename for uploads by combining the original name with a short UUID.
        
        Parameters:
        file (FileStorage): The file object being uploaded
        
        Returns:
        str: A unique filename
        """
        # Generate a shorter unique identifier by taking the first 8 characters of the UUID
        short_uuid = str(uuid.uuid4())[:8]
        # Original filename
        original_filename = secure_filename(file.filename)
        name_part = os.path.splitext(original_filename)[0]  # Get the name part without extension
        extension = os.path.splitext(original_filename)[1]  # Get the file extension

        # Combine the original name with the short UUID
        unique_filename = f"{name_part}_{short_uuid}{extension}"
        return unique_filename
