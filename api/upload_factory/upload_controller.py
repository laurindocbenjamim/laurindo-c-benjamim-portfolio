from api.dependencies import os
from api.dependencies import request, current_app
from api.dependencies import jsonify
from api.dependencies import Resource
from api.dependencies import secure_filename
from api.utils.validators import validate_file

class FileUploadResource(Resource):
    def post(self):
        if 'file' not in request.files:
            return jsonify({"error": "No file part"})
        
        file = request.files['jobRequirements']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"})
        
        if file and validate_file(file, current_app.config['UPLOAD_EXTENSIONS_IMAGE_ALLOWED']):
            filename = secure_filename(file.filename)
            file.save(os.path.join('uploads', filename))
            return jsonify({"message": "File successfully uploaded."})
        else:
            return jsonify({"error": "Invalid file"})
            
    def get(self):
        return jsonify({"message": "Send a POST request to upload a file."})
