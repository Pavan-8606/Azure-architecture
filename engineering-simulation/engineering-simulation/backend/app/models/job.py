from datetime import datetime, timezone
from app.extensions import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulations.id'), nullable=False)
    job_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(30), nullable=False, default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED
    progress = db.Column(db.Integer, nullable=False, default=0)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    execution_time = db.Column(db.Float, nullable=True)
    result = db.Column(db.String(255), nullable=True)
    error_message = db.Column(db.Text, nullable=True)

    # Relationship back to Simulation
    simulation = db.relationship('Simulation', backref=db.backref('jobs', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            "id": self.id,
            "simulationId": self.simulation_id,
            "jobNumber": self.job_number,
            "status": self.status,
            "progress": self.progress,
            "startedAt": self.started_at.isoformat() if self.started_at else None,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "executionTime": self.execution_time,
            "result": self.result,
            "errorMessage": self.error_message
        }
