

import pyotp, os
import logging
from datetime import timedelta

def create_logger(app):
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(os.path.join(app.root_path,'static/app.log')),
            logging.StreamHandler()
        ]
    )

def send_confirmation_email(email):
    pass

def generate_2fa_secret():
    pass

