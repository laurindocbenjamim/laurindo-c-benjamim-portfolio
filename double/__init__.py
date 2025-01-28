import os
from flask import Flask
from api.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Create directories
    os.makedirs(os.path.join(app.root_path, 'static', app.config['UPLOAD_VIDEO_FOLDER']), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', app.config['UPLOAD_DOCS_FOLDER']), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', app.config['DECRYPTED_FOLDER']), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', app.config['MODIFIED_FOLDER']), exist_ok=True)

    os.chmod(os.path.join(app.root_path, 'static', app.config['UPLOAD_VIDEO_FOLDER']), 0o755)
    os.chmod(os.path.join(app.root_path, 'static', app.config['UPLOAD_DOCS_FOLDER']),  0o755)
    os.chmod(os.path.join(app.root_path, 'static', app.config['DECRYPTED_FOLDER']), 0o755)
    os.chmod(os.path.join(app.root_path, 'static', app.config['MODIFIED_FOLDER']), 0o755)

    with app.app_context():
        from . import routes
    return app
