
import os
from flask_restful import Resource
from flask import send_file, current_app


class DownloadPdfFileRepository(Resource): 
    def get(self, filename): 
        file_path = os.path.join(current_app.root_path, 'static', current_app.config['MODIFIED_FOLDER'], filename) 
        return send_file(file_path, as_attachment=True)