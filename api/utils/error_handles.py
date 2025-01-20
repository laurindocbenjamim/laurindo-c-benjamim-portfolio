
from flask_wtf.csrf import CSRFError
from api.dependencies import jsonify
# Method to handle errors
def handle_errors(*,app):
    
    @app.errorhandler(CSRFError)
    def handle_csrf_error(e):
        return jsonify({"error": e.description})

    # Error handling for file too large
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return f"File is too large. The maximum size is {app.config['MAX_CONTENT_LENGTH']}MB.", 413