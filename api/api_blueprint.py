from api.dependencies import Blueprint
from flask_restful import Api, Resource
from api.dependencies import ProxyFix, CORS
from api.utils.cors_police import allowed_domains_to_api_route
from api.utils.cors_police import allowed_domains_to_upload_route
from api.utils.cors_police import allowed_domains_to_files_route

from api.video.video_resource import VideoResource
from api.upload_factory.upload_controller import FileUploadResource
from api.upload_factory.upload_multiple_controller import FilesUploadResource

bp=Blueprint("api", url_prefix="/api")

api = Api(bp)#API  
cors = CORS(bp, resources={
    r"/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/upload": {"origins": allowed_domains_to_upload_route()},
    r"/api/files-storage": {"origins": allowed_domains_to_files_route()},
    r"/api/*": {"origins": allowed_domains_to_api_route()},
})