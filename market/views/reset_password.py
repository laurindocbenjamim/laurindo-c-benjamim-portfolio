
from flask import Blueprint, request
from market import limiter

app = Blueprint('reset',__name__)

@app.route('/reset-password', methods=['POST'])
@limiter.limit('3/hour')
def request_password_reset():
    email = request.json.get('email')
    # Send reset email with token

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    # Verify token and update password