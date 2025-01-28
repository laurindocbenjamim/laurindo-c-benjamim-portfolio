
from market import (
    jwt_required, 
    get_jwt_identity, 
    jsonify,
    request
)
from flask import Blueprint

app = Blueprint('2fa',__name__)

# Two-Factor Authentication
@app.route('/api/auth/2fa', methods=['POST'])
@jwt_required()
def enable_2fa():
    user = get_jwt_identity()
    # Generate secret and QR code
    return jsonify(secret="secret", qr_code="qr_code")

@app.route('/api/auth/verify-2fa', methods=['POST'])
@jwt_required()
def verify_2fa():
    user = get_jwt_identity()
    token = request.json.get('token')
    # Verify token using pyotp
    
