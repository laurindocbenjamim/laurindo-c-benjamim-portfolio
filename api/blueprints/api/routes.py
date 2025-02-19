from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user

api_bp = Blueprint('api', __name__)

@api_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    return jsonify({
        "message": "Protected data",
        "user": current_user.to_dict()
    })