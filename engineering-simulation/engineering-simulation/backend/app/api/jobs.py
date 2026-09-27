from flask import Blueprint, jsonify
from app.extensions import db
from app.models.job import Job

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/jobs', methods=['GET'])
def get_all_jobs():
    try:
        jobs = Job.query.order_by(Job.id.desc()).all()
        return jsonify({
            'success': True,
            'jobs': [j.to_dict() for j in jobs]
        }), 200
    except Exception:
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        return jsonify({
            'success': True,
            'job': job.to_dict()
        }), 200
    except Exception:
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@jobs_bp.route('/jobs/<int:job_id>/cancel', methods=['POST'])
def cancel_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        if job.status in ['COMPLETED', 'FAILED']:
            return jsonify({'success': False, 'error': f'Cannot cancel job in {job.status} state'}), 400

        job.status = 'FAILED'
        job.error_message = 'Cancelled by user'
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Job cancelled successfully',
            'job': job.to_dict()
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500
