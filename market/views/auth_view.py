import secrets, string
import logging
from flask import Blueprint, request, jsonify, current_app
from market.models.user_model import User
from market.config import token_blocklist, db, limiter

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
import phonenumbers
from market.utils import send_confirmation_email, generate_2fa_secret
from market.security import sanitize_sql
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import timedelta

auth = Blueprint('auth', __name__, url_prefix='/auth')

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

# Utility Functions
def generate_secret_key(bytesN=16):
    """
    Generates a secure key consisting of a mix of uppercase, lowercase, digits, and special characters.

    Args:
        bytesN (int): The number of bytes to be converted into a hexadecimal string, 
                      which forms the base of the key (default is 16 bytes).

    Returns:
        str: A secure, randomly generated key string.
    """
    hex_string = secrets.token_hex(bytesN)
    special_characters = string.punctuation
    secure_key = ''.join(secrets.choice(hex_string + special_characters) for _ in range(32))
    return f"SECRET-KEY: {secure_key}"


def validate_credentials(identifier, password):
    if '@' in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        try:
            parsed = phonenumbers.parse(identifier, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError
            user = User.query.filter_by(phone=identifier).first()
        except:
            return None
    return user if user and user.check_password(password) else None

# Routes
@auth.route('/secret-key')
def secret_k():
    return generate_secret_key(bytesN=16)

@auth.route('/api/auth/register', methods=['POST'])
@limiter.limit('5/minute')
def register():
    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not (email or phone):
        return jsonify(error="Email or phone required"), 400

    if email:
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify(error="Invalid email format"), 400

    if phone:
        try:
            parsed = phonenumbers.parse(phone, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError
        except:
            return jsonify(error="Invalid phone number"), 400

    existing_user = User.query.filter((User.email == email) | (User.phone == phone)).first()
    if existing_user:
        return jsonify(error="User already exists"), 409

    new_user = User(email=email, phone=phone)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="Registration successful"), 201

@auth.route('/api/auth/login', methods=['POST'])
@limiter.limit('5/minute')
def login():
    data = request.get_json()
    identifier = data.get('identifier')
    password = data.get('password')

    user = validate_credentials(identifier, password)
    if not user:
        logger.warning(f"Failed login attempt for {identifier}")
        return jsonify(error="Invalid credentials"), 401

    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)

    response = jsonify({
        'message': 'Login successful',
        'user': {'id': user.id, 'email': user.email, 'phone': user.phone}
    })
    
    response.set_cookie(
        'access_token_cookie',
        value=access_token,
        httponly=True,
        secure=True,
        samesite='Strict'
    )
    
    response.set_cookie(
        'refresh_token_cookie',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='Strict'
    )

    return response, 200

@auth.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    token_blocklist.add(jti)
    response = jsonify(message="Logout successful")
    response.delete_cookie('access_token_cookie')
    response.delete_cookie('refresh_token_cookie')
    return response

@auth.route('/register', methods=['POST'])
def register_user():
    """
    Register new user with email confirmation
    ---
    parameters:
    - name: email
        type: string
        required: true
    - name: password
        type: string
        required: true
    - name: first_name
        type: string
        required: true
    - name: last_name
        type: string
        required: true
    """
    data = request.get_json()
    # Input sanitization
    email = sanitize_sql(data.get('email'))
    password = sanitize_sql(data.get('password'))
    first_name = sanitize_sql(data.get('first_name'))
    last_name = sanitize_sql(data.get('last_name'))
    
    # Validate input and create user
    # ...
    send_confirmation_email("user")
    return jsonify(message='Confirmation email sent'), 201

@auth.route('/confirm/<token>')
def confirm_email(token):
    """Confirm user email with token"""
    # Token verification logic
    return jsonify(message='Email confirmed')

@auth.route('/reset-password', methods=['POST'])
def request_password_reset():
    """Initiate password reset process"""
    # Send reset email
    return jsonify(message='Reset instructions sent')

@auth.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    user = User.query.get(get_jwt_identity())
    # Handle profile update
    return jsonify(user.safe_dict())
