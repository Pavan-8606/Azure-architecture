import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-engineering-simulation')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1']
    # Database configuration placeholder for future SQLite integration
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), '../instance/app.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
