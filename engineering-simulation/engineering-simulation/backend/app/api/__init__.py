from flask import Blueprint
from app.api.health import health_bp
from app.api.simulations import simulations_bp
from app.api.jobs import jobs_bp

api_bp = Blueprint('api', __name__, url_prefix='/api')
api_bp.register_blueprint(health_bp)
api_bp.register_blueprint(simulations_bp)
api_bp.register_blueprint(jobs_bp)
