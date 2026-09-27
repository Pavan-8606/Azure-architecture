import traceback
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.simulation import Simulation
from app.models.job import Job
from app.services import executor_service

simulations_bp = Blueprint('simulations', __name__)

SUPPORTED_TYPES = [
    'Structural Analysis',
    'Thermal Analysis',
    'Fluid Dynamics',
    'General Engineering'
]

SUPPORTED_PRIORITIES = ['Low', 'Normal', 'High']

@simulations_bp.route('/simulations', methods=['POST'])
def create_simulation():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({'success': False, 'error': 'Invalid or missing JSON payload'}), 400

        # 1. Validate name
        name = data.get('name')
        if not isinstance(name, str) or not name.strip():
            return jsonify({'success': False, 'error': 'Simulation name is required'}), 400
        name = name.strip()

        # 2. Validate simulationType
        simulation_type = data.get('simulationType')
        if not simulation_type or simulation_type not in SUPPORTED_TYPES:
            return jsonify({
                'success': False, 
                'error': f"simulationType must be one of: {', '.join(SUPPORTED_TYPES)}"
            }), 400

        # 3. Validate numberOfJobs (1 - 300)
        try:
            number_of_jobs = int(data.get('numberOfJobs'))
            if number_of_jobs < 1 or number_of_jobs > 300:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'numberOfJobs must be an integer between 1 and 300'}), 400

        # 4. Validate computeNodes (1 - 10)
        try:
            compute_nodes = int(data.get('computeNodes'))
            if compute_nodes < 1 or compute_nodes > 10:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'computeNodes must be an integer between 1 and 10'}), 400

        # 5. Validate priority
        priority = data.get('priority', 'Normal')
        if priority not in SUPPORTED_PRIORITIES:
            return jsonify({
                'success': False, 
                'error': f"priority must be one of: {', '.join(SUPPORTED_PRIORITIES)}"
            }), 400

        # Optional / defaulted fields
        description = data.get('description', '')
        duration_per_job = str(data.get('durationPerJob', '5'))
        node_size = data.get('nodeSize', 'Medium')
        parallel_execution = bool(data.get('parallelExecution', True))
        save_results = bool(data.get('saveResults', True))

        # Create model entity
        sim = Simulation(
            name=name,
            description=description,
            simulation_type=simulation_type,
            number_of_jobs=number_of_jobs,
            duration_per_job=duration_per_job,
            priority=priority,
            compute_nodes=compute_nodes,
            node_size=node_size,
            parallel_execution=parallel_execution,
            save_results=save_results,
            status="CREATED"
        )

        db.session.add(sim)
        db.session.commit()

        # Pre-create Job records in QUEUED state for every requested job
        for i in range(1, sim.number_of_jobs + 1):
            job = Job(
                simulation_id=sim.id,
                job_number=i,
                status="QUEUED",
                progress=0
            )
            db.session.add(job)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Simulation created successfully',
            'simulation': sim.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@simulations_bp.route('/simulations', methods=['GET'])
def get_simulations():
    try:
        sims = Simulation.query.order_by(Simulation.created_at.desc()).all()
        return jsonify({
            'success': True,
            'simulations': [sim.to_dict() for sim in sims]
        }), 200
    except Exception:
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@simulations_bp.route('/simulations/<int:sim_id>', methods=['GET'])
def get_simulation(sim_id):
    try:
        sim = Simulation.query.get(sim_id)
        if not sim:
            return jsonify({'success': False, 'error': 'Simulation not found'}), 404
        return jsonify({
            'success': True,
            'simulation': sim.to_dict()
        }), 200
    except Exception:
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@simulations_bp.route('/simulations/<int:sim_id>/start', methods=['POST'])
def start_simulation(sim_id):
    try:
        sim = Simulation.query.get(sim_id)
        if not sim:
            return jsonify({'success': False, 'error': 'Simulation not found'}), 404

        if sim.status == 'RUNNING':
            return jsonify({'success': False, 'error': 'Simulation is already running'}), 400

        # Ensure job records exist
        existing_jobs_count = Job.query.filter_by(simulation_id=sim_id).count()
        if existing_jobs_count < sim.number_of_jobs:
            for i in range(existing_jobs_count + 1, sim.number_of_jobs + 1):
                job = Job(
                    simulation_id=sim.id,
                    job_number=i,
                    status="QUEUED",
                    progress=0
                )
                db.session.add(job)

        sim.status = 'RUNNING'
        db.session.commit()

        # Submit to local background executor
        app_instance = current_app._get_current_object()
        executor_service.submit_simulation(sim.id, app_instance)

        return jsonify({
            'success': True,
            'message': 'Simulation started successfully',
            'simulation': sim.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error starting simulation:", e)
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500


@simulations_bp.route('/simulations/<int:sim_id>/jobs', methods=['GET'])
def get_simulation_jobs(sim_id):
    try:
        sim = Simulation.query.get(sim_id)
        if not sim:
            return jsonify({'success': False, 'error': 'Simulation not found'}), 404

        jobs = Job.query.filter_by(simulation_id=sim_id).order_by(Job.job_number.asc()).all()
        return jsonify({
            'success': True,
            'simulationId': sim_id,
            'jobs': [j.to_dict() for j in jobs]
        }), 200
    except Exception:
        return jsonify({'success': False, 'error': 'An internal server error occurred'}), 500
