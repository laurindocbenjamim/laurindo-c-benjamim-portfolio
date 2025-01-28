from flask import Blueprint

app = Blueprint('oauth2',__name__)

# Example Google Login
@app.route('/google')
def google_login():
    google = oauth.create_client('google')
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/google/callback')
def google_callback():
    google = oauth.create_client('google')
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    # Create or authenticate user
    
#++++++

