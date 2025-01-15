
from flask_restful import Resource
from flask import send_file, current_app


class VideoResource(Resource): 
    def get(self, filename): 
        video_path = 'static/'+current_app.config['UPLOAD_VIDEO_FOLDER'] + f'/{filename}' 
        return send_file(video_path, mimetype='video/mp4')