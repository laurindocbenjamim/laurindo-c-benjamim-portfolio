from api.dependencies import os
from api.dependencies import imghdr
from api.dependencies import current_app


def allowed_file(filename,allowed_extensions):
    """Check if a file is an allowed type."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_file(file, allowed_extensions):
    extension = os.path.splitext(file.filename)[1].lower() 
    mime_type = file.mimetype
   
    # Check if the extension is allowed and validate accordingly
    if extension in allowed_extensions:
        
       # Special handling for image files 
        if extension in current_app.config['UPLOAD_EXTENSIONS_IMAGE_ALLOWED']:
            """[ext.strip('.') for ext in extensions_with_dot] 
            iterates over each extension in the original list and removes the leading dot using strip('.').
            """
            return imghdr.what(file.stream) in [ext.strip('.') for ext in current_app.config['UPLOAD_EXTENSIONS_IMAGE_ALLOWED']]
        
        # Validate MIME type for DOC/DOCX files removing first the '.pdf' from the list
        elif extension in [ext for ext in current_app.config['UPLOAD_EXTENSION_DOCS_ALLOWED'] if ext != '.pdf']: 
            return mime_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] 
        
        # Validate MIME type for PDF files
        elif extension in current_app.config['UPLOAD_EXTENSION_DOCS_ALLOWED']: 
            return mime_type == 'application/pdf'

        elif extension in current_app.config['UPLOAD_EXTENSIONS_VIDEO_ALLOWED']: 
            return mime_type in ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska']
        
    return False
        
def validate_image_file(file, allowed_extensions):
    extension = os.path.splitext(file.filename)[1].lower()
    return extension in allowed_extensions and imghdr.what(file.stream) in [ext[1:] for ext in allowed_extensions]
