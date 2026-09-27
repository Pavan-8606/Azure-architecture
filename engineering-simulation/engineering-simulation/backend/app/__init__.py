import os
from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db

def create_app(config_class=Config):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_class)

    # Ensure instance directory exists for SQLite db storage
    os.makedirs(flask_app.instance_path, exist_ok=True)

    # Initialize extensions
    CORS(flask_app)
    db.init_app(flask_app)

    # Register blueprints
    from app.api import api_bp
    flask_app.register_blueprint(api_bp)

    # Automatically create SQLite tables if they do not exist
    with flask_app.app_context():
        from app.models.simulation import Simulation  # noqa: F401
        from app.models.job import Job                # noqa: F401
        db.create_all()

    return flask_app
