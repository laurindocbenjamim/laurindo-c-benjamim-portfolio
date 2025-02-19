from flask import Flask, render_template, jsonify, request
from jwt_2.config import Config
from api.utils.extensions import db, login_manager, jwt, cors, limiter
from jwt_2.models.user import User
#from jwt_2.models.token import TokenBlocklist
import secrets

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['JWT_SECRET_KEY'] = secrets.token_urlsafe(64)  # Secure key
    app.config['JWT_ALGORITHM'] = "HS256"

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, 
                origins=app.config['CORS_ORIGINS'],
                supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])
    limiter.init_app(app)
    
    # Register blueprints
    from jwt_2.blueprints.auth.routes import auth_bp
    from jwt_2.blueprints.api.routes import api_bp
    from jwt_2.blueprints.admin.routes import admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    # JWT configuration
    """@jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.get(identity)
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "token_expired",
            "message": "The token has expired"
        }), 401

    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "error": "invalid_token",
            "message": "Signature verification failed"
        }), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            "error": "unauthorized",
            "message": "Missing or invalid credentials"
        }), 401
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return render_template('404.html'), 404
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({"error": "Rate limit exceeded"}), 429
    

    @app.before_request
    def log_request_info():
        app.logger.debug(f"Headers: {dict(request.headers)}")
        app.logger.debug(f"Cookies: {request.cookies}")
        app.logger.debug(f"Endpoint: {request.endpoint}")"""
    
    return app