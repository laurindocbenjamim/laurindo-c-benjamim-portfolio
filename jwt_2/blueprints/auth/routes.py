from datetime import timedelta
from flask import Blueprint, request, jsonify, render_template, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    current_user
)
from datetime import datetime
from jwt_2.models.user import User
from jwt_2.models.token import TokenBlocklist
from api.utils.extensions import db, limiter

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    response = jsonify({"message": "testing login"}), 200

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not data or not username or not password:
        response = jsonify({"error": "Missing credentials"}), 400
    
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        response = jsonify({"error": f"Invalid credentials {not user.check_password(password)}"}), 400
    
    access_token = create_access_token(identity=username, expires_delta=timedelta(hours=1))
    response = jsonify({'access_token': access_token})

    return response

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@limiter.limit("5 per minute")
def refresh():
    response = jsonify({"message": "testing token refresh"}), 200
    return response

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
   response = jsonify({"message": "testing logout"}), 200
   return response