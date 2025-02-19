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
from api.models.user import User
from api.models.token import TokenBlocklist
from api.utils.extensions import db, limiter

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing credentials"}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": f"Invalid credentials {not user.check_password(data['password'])}"}), 400
    
    # ... validation ...
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"user": user.to_dict()}
    )
    current_app.logger.debug(f"Generated access token: {access_token}")
   
    refresh_token = create_refresh_token(identity=user.id)
    
    
    if request.is_json:
        response = jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        })
    else:
        response = render_template('profile.html', user=user)
    

    
    # Set cookie expiration to match token expiration
    set_access_cookies(
        response, 
        access_token,
        max_age=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()
    )
    set_refresh_cookies(
        response,
        refresh_token,
        max_age=current_app.config['JWT_REFRESH_TOKEN_EXPIRES'].total_seconds()
    )
    return response

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@limiter.limit("5 per minute")
def refresh():
    try:
        user_id = get_jwt_identity()
        jti = get_jwt()["jti"]
        
        # Revoke old refresh token
        revoked_token = TokenBlocklist(
            jti=jti,
            token_type="refresh",
            user_id=user_id,
            expires_at=datetime.utcfromtimestamp(get_jwt()["exp"])
        )
        db.session.add(revoked_token)
        
        # Create new tokens
        new_access = create_access_token(identity=user_id)
        new_refresh = create_refresh_token(identity=user_id)
        
        response = jsonify({"message": "Tokens refreshed"})
        set_access_cookies(response, new_access)
        set_refresh_cookies(response, new_refresh)
        
        db.session.commit()
        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Token refresh failed"}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        access_jti = get_jwt()["jti"]
        refresh_jti = get_jwt().get("refresh_jti")
        
        # Revoke both tokens
        db.session.add(TokenBlocklist(
            jti=access_jti,
            token_type="access",
            user_id=current_user.id,
            expires_at=datetime.utcfromtimestamp(get_jwt()["exp"])
        ))
        
        if refresh_jti:
            db.session.add(TokenBlocklist(
                jti=refresh_jti,
                token_type="refresh",
                user_id=current_user.id,
                expires_at=datetime.utcfromtimestamp(get_jwt()["exp"])
            ))
        
        db.session.commit()
        response = jsonify({"message": "Logged out"})
        unset_jwt_cookies(response)
        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Logout failed"}), 500