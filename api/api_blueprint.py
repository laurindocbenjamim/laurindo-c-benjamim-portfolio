from api.dependencies import Blueprint
from flask_restful import Api, Resource
from api.dependencies import ProxyFix, CORS
from api.utils.cors_police import allowed_domains_to_api_route
from api.utils.cors_police import allowed_domains_to_upload_route
from api.utils.cors_police import allowed_domains_to_files_route

from api.utils.csrf_token import CSRFToken
from api.video.video_resource import VideoResource
from api.video.video_analyzer import VideoAnalyzerResource
from api.upload_factory.upload_controller import FileUploadResource
from api.upload_factory.upload_multiple_controller import FilesUploadResource
from api.config import csrf


bp=Blueprint("api", __name__, url_prefix="/api")
# Create API instance
api = Api(bp)#API  
"""cors = CORS(bp, resources={
    r"/api/csrf-token/get": {"origins": allowed_domains_to_upload_route()},
    r"/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/files-storage": {"origins": allowed_domains_to_files_route()},
    r"/api/*": {"origins": allowed_domains_to_api_route()},
})"""

# exclude all the views of a blueprint.

csrf.exempt(bp)

def api_endpoints(csrf):
    
    # Generate csrf token
    api.add_resource(CSRFToken,'/csrf-token/get')
    #API  
    api.add_resource(VideoResource, '/files-storage/video/get/<string:filename>')

    # Add resource endpoints 
    api.add_resource(FileUploadResource, '/upload')

    api.add_resource(FilesUploadResource, '/files-storage/upload')

    # Create the Video analyzer API endpoint
    #api.add_resource(VideoAnalyzerResource, '/video-analyzer/demo')