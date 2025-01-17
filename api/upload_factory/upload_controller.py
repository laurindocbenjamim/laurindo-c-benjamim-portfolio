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
        
        # Define the upload directory path within the Flask static folder
        static_dir = os.path.join(current_app.root_path, 'static')
        upload_dir = os.path.join(static_dir, current_app.config['UPLOAD_DOCS_FOLDER'])
        # Define the upload directory path 
        #upload_dir = os.path.join(os.getcwd(), current_app.config['UPLOAD_DOCS_FOLDER']) 
        # Create the directory if it does not exist 
        if not os.path.exists(upload_dir): 
            os.makedirs(upload_dir, mode=0o755) # Read and execute permissions

        if file and validate_file(file, current_app.config['ALLOWED_EXTENSIONS']):
            # Generate a unique filename using UUID 
            original_name=str(os.path.splitext(file.filename)[0]).replace(' ','_').lower()
            """
            Old: unique_filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1] 
                It returns a log unique ID.
                
            """
            # Original filename 
            original_filename = secure_filename(file.filename) 
            name_part = os.path.splitext(original_filename)[0] 
            # Get the name part without extension 
            extension = os.path.splitext(original_filename)[1] 
            # Get the file extension # Generate a shorter unique identifier by taking the first 8 characters of the UUID 
            short_uuid = str(uuid.uuid4())[:8] 
            # Combine the original name with the short UUID 
            unique_filename = f"{name_part}_{short_uuid}{extension}"

            filename = secure_filename(unique_filename)
        
            file.save(os.path.join(upload_dir, filename))
            return jsonify({"message": "File successfully uploaded."})
        else:            
            return jsonify({"error": f"Invalid file format!{1+0}"})
            
    def get(self):
        return jsonify({"message": "Send a POST request to upload a file."})
