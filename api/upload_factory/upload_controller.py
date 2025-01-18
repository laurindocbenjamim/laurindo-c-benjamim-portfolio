from api.dependencies import request,current_app, jsonify, Resource
from api.upload_factory.file_upload import save_uploaded_file  # Import the file upload module

class FileUploadResource(Resource):
    def post(self):
        # Check if the request contains the file part
        if 'contentOrigin' in request.form and request.form['contentOrigin'] =='file':
            if 'cvUpload' not in request.files:
                return jsonify({"status":400, "error": "No file part"})
            elif 'jobRequirements' not in request.files:
                return jsonify({"status":400, "error": "No file part"})

            file = request.files['cvUpload']
            file2 = request.files['jobRequirements']
        
            # Check if a file has been selected
            if file.filename == '' or file2.filename == '':
                return jsonify({"status":400, "error": "No selected file"})

            # Use the save_uploaded_file function from the module
            file_directory=current_app.config['UPLOAD_DOCS_FOLDER']
            status,result = save_uploaded_file(file,file_directory)
            if status:
                status,result = save_uploaded_file(file2,file_directory)
            return jsonify(result)
        return jsonify({"status":400, "error": "The origin field has not been found!"})
            
    def get(self):
        # Provide instructions for using the POST method for file upload
        return jsonify({"status":400, "message": "Send a POST request to upload a file."})
