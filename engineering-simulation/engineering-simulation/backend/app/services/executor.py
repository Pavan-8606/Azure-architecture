import time
import math
import threading
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

from app.extensions import db
from app.models.simulation import Simulation
from app.models.job import Job

class BaseSimulationExecutor(ABC):
    """
    Abstract Base Class for Simulation Executors.
    Enables swapping LocalSimulationExecutor with AzureBatchExecutor in future phases
    without modifying API routes or application controllers.
    """
    @abstractmethod
    def submit_simulation(self, simulation_id: int, flask_app) -> bool:
        pass


class LocalSimulationExecutor(BaseSimulationExecutor):
    """
    Local multi-threaded simulation executor.
    Executes lightweight deterministic engineering workloads across a thread pool
    capped by the simulation's `compute_nodes` count.
    """
    def submit_simulation(self, simulation_id: int, flask_app) -> bool:
        # Launch background orchestrator thread to prevent blocking HTTP handler
        orchestrator = threading.Thread(
            target=self._run_simulation_orchestrator,
            args=(simulation_id, flask_app),
            daemon=True
        )
        orchestrator.start()
        return True

    def _run_simulation_orchestrator(self, simulation_id: int, flask_app):
        with flask_app.app_context():
            sim = Simulation.query.get(simulation_id)
            if not sim:
                return

            jobs = Job.query.filter_by(simulation_id=simulation_id).all()
            if not jobs:
                return

            # Max workers bounded by configured compute_nodes (1 to 10)
            max_workers = min(max(1, sim.compute_nodes), 10)

            # Execute jobs concurrently across worker pool
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [
                    executor.submit(self._execute_single_job, job.id, flask_app, sim.simulation_type)
                    for job in jobs
                ]
                for future in futures:
                    future.result()  # Wait for job completion in background thread

            # Re-fetch simulation state after all jobs complete
            sim = Simulation.query.get(simulation_id)
            all_jobs = Job.query.filter_by(simulation_id=simulation_id).all()

            completed_count = sum(1 for j in all_jobs if j.status == 'COMPLETED')
            failed_count = sum(1 for j in all_jobs if j.status == 'FAILED')

            if failed_count == 0:
                sim.status = 'COMPLETED'
            elif completed_count > 0:
                sim.status = 'COMPLETED_WITH_ERRORS'
            else:
                sim.status = 'FAILED'

            db.session.commit()

    def _execute_single_job(self, job_id: int, flask_app, sim_type: str):
        with flask_app.app_context():
            job = Job.query.get(job_id)
            if not job or job.status == 'FAILED':
                # Skip if job was cancelled
                return

            job.status = 'RUNNING'
            job.started_at = datetime.now(timezone.utc)
            job.progress = 10
            db.session.commit()

            start_time = time.time()

            try:
                # Deterministic lightweight engineering calculation
                job_num = job.job_number
                
                # Simulating multi-step iterations with progress updates
                for p in [25, 50, 75]:
                    time.sleep(0.08)  # Lightweight delay to simulate workload execution
                    job.progress = p
                    db.session.commit()

                # Perform workload math calculation based on job_number & type
                iterations = 50000 + (job_num * 1234)
                calc_val = 0.0
                for i in range(1, 1000):
                    calc_val += math.sin(i * job_num) * math.cos(i / (job_num + 1))

                elapsed = round(time.time() - start_time, 3)

                # Format specific engineering domain output
                if sim_type == 'Structural Analysis':
                    stress_val = round(abs(calc_val * 15.2) + (job_num * 2.5), 2)
                    result_str = f"Stress Peak: {stress_val} MPa | Displacement: {round(stress_val * 0.04, 3)} mm"
                elif sim_type == 'Thermal Analysis':
                    temp_val = round(20.0 + abs(calc_val * 8.5) + (job_num * 1.8), 2)
                    result_str = f"Max Temp: {temp_val} °C | Flux: {round(temp_val * 1.25, 2)} W/m²"
                elif sim_type == 'Fluid Dynamics':
                    velocity_val = round(abs(calc_val * 3.4) + (job_num * 0.4), 2)
                    result_str = f"Max Velocity: {velocity_val} m/s | Pressure Drop: {round(velocity_val * 12.1, 1)} Pa"
                else:
                    result_str = f"Result Val: {round(calc_val, 4)} | Iterations: {iterations}"

                job.status = 'COMPLETED'
                job.progress = 100
                job.completed_at = datetime.now(timezone.utc)
                job.execution_time = elapsed
                job.result = result_str
                db.session.commit()

            except Exception as e:
                db.session.rollback()
                job.status = 'FAILED'
                job.progress = 0
                job.completed_at = datetime.now(timezone.utc)
                job.error_message = str(e)
                db.session.commit()


# Factory / Instance for global simulation executor service
executor_service = LocalSimulationExecutor()
