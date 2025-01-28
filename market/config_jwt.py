
from flask import jsonify
from market.models.user_model import User
from market.config import token_blocklist
from market import logger
# Config the JWT Authentication

def config_jwt(*,app, jwt):
    # JWT Configuration
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in token_blocklist

    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data['sub']
        return User.query.get(identity)

    # Error Handlers
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify(error="Internal server error"), 500

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify(error="Invalid token"), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify(error="Authorization required"), 401