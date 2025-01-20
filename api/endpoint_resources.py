
from api.video.video_resource import VideoResource
from api.video.video_analyzer import VideoAnalyzerResource
from api.upload_factory.upload_controller import FileUploadResource
from api.upload_factory.upload_multiple_controller import FilesUploadResource

# Method to load the restfull endpoints
def load_restfull_endpoints(api):
    """ Method to load the endpoint resources of the RESTFull Application

    Args: api - is API Application instance

    Return: null
    
    """
    #API  
    api.add_resource(VideoResource, '/api/files-storage/video/get/<string:filename>')

    # Add resource endpoints 
    api.add_resource(FileUploadResource, '/api/upload')

    api.add_resource(FilesUploadResource, '/api/files-storage/upload')

    # Create the Video analyzer API endpoint
    api.add_resource(VideoAnalyzerResource, '/api/video-analyzer/demo')