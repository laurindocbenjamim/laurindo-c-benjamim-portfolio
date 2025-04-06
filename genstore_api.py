import os
import uuid
import json
import stripe
import flask
from flask import Flask, request, jsonify, redirect, url_for, session, render_template_string, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure application
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'my_secret_key_for_development')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///filedrive.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB max upload size

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Initialize Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Set up Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_your_stripe_key')

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    country_code = db.Column(db.String(5), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subscription_status = db.Column(db.String(20), default='free')  # free, basic, premium
    stripe_customer_id = db.Column(db.String(100), nullable=True)
    files = db.relationship('File', backref='owner', lazy=True)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    original_filename = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    file_type = db.Column(db.String(50), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    stripe_payment_id = db.Column(db.String(100), nullable=True)
    payment_status = db.Column(db.String(20), default='pending')  # pending, complete, failed
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    subscription_plan = db.Column(db.String(20), nullable=True)  # basic, premium

# Helper functions
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def allowed_file(filename):
    # Allow all files for now - in production you might want to restrict this
    return True

# Route for home page
@app.route('/')
def home():
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CloudDrive - Cloud Storage</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                width: 80%;
                margin: auto;
                overflow: hidden;
            }
            header {
                background: #35424a;
                color: white;
                padding-top: 30px;
                min-height: 70px;
                border-bottom: #0e7c7b 3px solid;
            }
            header a {
                color: #fff;
                text-decoration: none;
                text-transform: uppercase;
                font-size: 16px;
            }
            header .branding {
                float: left;
            }
            header .branding h1 {
                margin: 0;
            }
            header nav {
                float: right;
                margin-top: 10px;
            }
            header nav ul {
                padding: 0;
                margin: 0;
            }
            header nav li {
                display: inline;
                padding: 0 20px;
            }
            .hero {
                min-height: 400px;
                background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80') no-repeat 0 -300px;
                background-size: cover;
                text-align: center;
                color: white;
            }
            .hero h1 {
                margin-top: 100px;
                font-size: 55px;
                margin-bottom: 10px;
            }
            .hero p {
                font-size: 20px;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                background: #0e7c7b;
                color: white;
                padding: 10px 20px;
                border: none;
                cursor: pointer;
                text-decoration: none;
                font-size: 18px;
                border-radius: 5px;
            }
            .button:hover {
                background: #35424a;
            }
            .boxes {
                margin-top: 20px;
            }
            .box {
                float: left;
                width: 30%;
                padding: 10px;
                text-align: center;
            }
            .box i {
                font-size: 40px;
                color: #0e7c7b;
            }
            footer {
                padding: 20px;
                margin-top: 20px;
                color: #ffffff;
                background-color: #35424a;
                text-align: center;
            }
            .clearfix:after {
                content: "";
                display: table;
                clear: both;
            }
            @media(max-width: 768px) {
                header .branding, header nav, header nav li, .box {
                    float: none;
                    text-align: center;
                    width: 100%;
                }
                .hero {
                    background-position: center;
                }
                .hero h1 {
                    margin-top: 60px;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="container">
                <div class="branding">
                    <h1>CloudDrive</h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="/">Home</a></li>
                        {% if current_user.is_authenticated %}
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="/logout">Logout</a></li>
                        {% else %}
                        <li><a href="/login">Login</a></li>
                        <li><a href="/register">Register</a></li>
                        {% endif %}
                    </ul>
                </nav>
            </div>
        </header>

        <section class="hero">
            <div class="container">
                <h1>Store Your Files in the Cloud</h1>
                <p>Secure, reliable cloud storage for all your important documents</p>
                {% if current_user.is_authenticated %}
                <a href="/dashboard" class="button">Go to Dashboard</a>
                {% else %}
                <a href="/register" class="button">Get Started</a>
                {% endif %}
            </div>
        </section>

        <section class="boxes container clearfix">
            <div class="box">
                <i>🔒</i>
                <h3>Secure Storage</h3>
                <p>Your files are encrypted and stored securely in our cloud infrastructure.</p>
            </div>
            <div class="box">
                <i>🌐</i>
                <h3>Access Anywhere</h3>
                <p>Access your files from any device, anywhere in the world.</p>
            </div>
            <div class="box">
                <i>💰</i>
                <h3>Affordable Plans</h3>
                <p>Choose from our range of affordable subscription plans.</p>
            </div>
        </section>

        <footer>
            <p>CloudDrive Cloud Storage, Copyright &copy; 2023</p>
        </footer>
    </body>
    </html>
    """)

# User Registration
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        phone = request.form.get('phone')
        country_code = request.form.get('country_code')
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered.')
            return redirect(url_for('register'))
        
        # Create Stripe customer
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                phone=f"{country_code}{phone}"
            )
        except Exception as e:
            flash(f'Error creating Stripe customer: {str(e)}')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            phone=phone,
            country_code=country_code,
            stripe_customer_id=customer.id
        )
        
        # Save user to database
        db.session.add(new_user)
        db.session.commit()
        
        # Log the user in
        login_user(new_user)
        
        flash('Registration successful!')
        return redirect(url_for('dashboard'))
    
    # Show registration form
    return f""
   
# User Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.')
            
    return f""

# User Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('home'))

# User Dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's files
    user_files = File.query.filter_by(user_id=current_user.id).all()
    
    # Calculate total storage used
    total_storage = sum(file.file_size for file in user_files)
    total_storage_mb = round(total_storage / (1024 * 1024), 2)
    
    return f""