from api.dependencies import os
from api.dependencies import imghdr

def validate_file(file, allowed_extensions):
    extension = os.path.splitext(file.filename)[1].lower()
    return extension in allowed_extensions and imghdr.what(file.stream) in [ext[1:] for ext in allowed_extensions]
