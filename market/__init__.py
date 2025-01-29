
  
# app.py (Backend)
import os, secrets
import logging
import cachetools
import phonenumbers
from flask import Flask, jsonify, request
#from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from flask_limiter import Limiter
#from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_talisman import Talisman
from werkzeug.security import generate_password_hash, check_password_hash

from email_validator import validate_email, EmailNotValidError
from datetime import timedelta
from market.config import TestingConfig, db, jwt, token_blocklist, limiter
from market.models.user_model import User
from market.utils import create_logger
from market.views.auth_view import auth
from market.views.market_view import market

app = Flask(__name__,instance_relative_config=True, static_folder='static')

# Creating the static folders
#os.makedirs(os.path.join('static', app.config['UPLOAD_FOLDER']),exist_ok=True)

# Cache Setup
cache = cachetools.TTLCache(maxsize=1000, ttl=app.config['CACHE_TTL'])
    
create_logger(app)

logger = logging.getLogger(__name__)


app_secret_key = os.environ.get('SECRET_KEY') 
jwt_secrete_key = os.environ.get('JWT_SECRET_KEY')
if not app_secret_key:
    raise ValueError("FLASK_SECRET_KEY environment variable not set.")
elif not jwt_secrete_key:
    raise ValueError("JWT_SECRET_KEY environment variable not set.")



def create_app(testing):

    if testing:
        app.config.from_object(TestingConfig())

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Security Middlewares
    #CORS(app, supports_credentials=True, origins=os.environ.get('ALLOWED_ORIGINS', '*'))
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": os.getenv('ALLOWED_ORIGINS', '*')}})
    Talisman(app, content_security_policy=None)
    #jwt = JWTManager(app)
    #db = SQLAlchemy(app)
    #db.init_app(app)
    #migrate = Migrate(app, db)
    # Rate Limiting
    """limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[app.config['RATE_LIMIT']]
    )"""
    limiter.init_app(app)

    #app.register_blueprint(market)
    #routes(app, limiter)
    
    @app.route('/')
    def index():
        return f"Ola "
    #app.register_blueprint(auth)
    return app
