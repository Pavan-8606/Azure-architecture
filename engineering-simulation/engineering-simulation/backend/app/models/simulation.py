from datetime import datetime, timezone
from app.extensions import db

class Simulation(db.Model):
    __tablename__ = 'simulations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    simulation_type = db.Column(db.String(80), nullable=False)
    number_of_jobs = db.Column(db.Integer, nullable=False)
    duration_per_job = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), nullable=False)
    compute_nodes = db.Column(db.Integer, nullable=False)
    node_size = db.Column(db.String(50), nullable=False)
    parallel_execution = db.Column(db.Boolean, default=True)
    save_results = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(30), nullable=False, default="Created")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "simulationType": self.simulation_type,
            "numberOfJobs": self.number_of_jobs,
            "durationPerJob": self.duration_per_job,
            "priority": self.priority,
            "computeNodes": self.compute_nodes,
            "nodeSize": self.node_size,
            "parallelExecution": self.parallel_execution,
            "saveResults": self.save_results,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
