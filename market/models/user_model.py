from market import db
from werkzeug.security import generate_password_hash, check_password_hash
import bleach

class User(db.Model):
    """
    User model representing application users
    """
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    password_hash = db.Column(db.String(256))
    profile_image = db.Column(db.String(256))
    two_factor_enabled = db.Column(db.Boolean, default=False)
    two_factor_secret = db.Column(db.String(256))
    email_confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    def sanitize_input(self, input_str):
        """Sanitize user input to prevent XSS"""
        return bleach.clean(input_str, strip=True)
    
    def set_password(self, password):
        """Hash and store password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def safe_dict(self):
        """Return sanitized user data"""
        return {
            'id': self.id,
            'email': self.sanitize_input(self.email) if self.email else None,
            'phone': self.sanitize_input(self.phone) if self.phone else None,
            'first_name': self.sanitize_input(self.first_name),
            'last_name': self.sanitize_input(self.last_name),
            'two_factor_enabled': self.two_factor_enabled
        }