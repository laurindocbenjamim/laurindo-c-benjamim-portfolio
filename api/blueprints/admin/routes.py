from flask import Blueprint, jsonify, render_template
from flask_jwt_extended import jwt_required, current_user
from api.models.user import User

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/')
@jwt_required()
def admin_dashboard():
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    return render_template('admin.html')

@admin_bp.route('/users')
@jwt_required()
def get_users():
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])