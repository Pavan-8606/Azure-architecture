import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import { fetchSimulationById, fetchSimulationJobs, startSimulation, cancelJob } from '../api/client';
import '../styles/detail.css';

export default function SimulationDetail({ simulationId, onBack }) {
  const [simulation, setSimulation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!simulationId) return;

    const [simRes, jobsRes] = await Promise.all([
      fetchSimulationById(simulationId),
      fetchSimulationJobs(simulationId)
    ]);

    if (simRes.success) {
      setSimulation(simRes.simulation);
    } else {
      setError(simRes.error || 'Failed to load simulation details');
    }

    if (jobsRes.success) {
      setJobs(jobsRes.jobs || []);
    }

    setLoading(false);
  }, [simulationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-polling every 2s while simulation is RUNNING
  useEffect(() => {
    if (!simulation || simulation.status !== 'RUNNING') return;

    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => clearInterval(interval);
  }, [simulation, loadData]);

  const handleStart = async () => {
    setStarting(true);
    setError('');
    const res = await startSimulation(simulationId);
    setStarting(false);

    if (res.success) {
      setSimulation(res.simulation);
      loadData();
    } else {
      setError(res.error || 'Failed to start simulation');
    }
  };

  const handleCancelJob = async (jobId) => {
    const res = await cancelJob(jobId);
    if (res.success) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="sim-detail-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading simulation details...</p>
      </div>
    );
  }

  if (error && !simulation) {
    return (
      <div className="sim-detail-container" style={{ padding: '2rem' }}>
        <div style={{ color: 'var(--status-offline)', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
        <Button variant="secondary" onClick={onBack}>Return to Dashboard</Button>
      </div>
    );
  }

  const queuedCount = jobs.filter(j => j.status === 'QUEUED').length;
  const runningCount = jobs.filter(j => j.status === 'RUNNING').length;
  const completedCount = jobs.filter(j => j.status === 'COMPLETED').length;
  const failedCount = jobs.filter(j => j.status === 'FAILED').length;
  const totalJobsCount = jobs.length || simulation.numberOfJobs || 0;

  const progressPercent = totalJobsCount > 0 
    ? Math.round(((completedCount + failedCount) / totalJobsCount) * 100) 
    : 0;

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="sim-detail-container">
      {/* Navigation Header */}
      <div className="sim-detail-top">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Dashboard
        </Button>
        <div className="sim-detail-actions">
          {simulation.status === 'CREATED' && (
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleStart}
              disabled={starting}
            >
              {starting ? 'Starting Execution...' : '▶ Start Simulation'}
            </Button>
          )}
          {simulation.status === 'RUNNING' && (
            <span className="sim-tag sim-tag-running" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              ⚡ Simulation Running...
            </span>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--status-offline)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="sim-detail-card">
        <div className="sim-detail-header">
          <div>
            <span className="sim-detail-id">SIM-#{String(simulation.id).padStart(4, '0')}</span>
            <h2 className="sim-detail-title">{simulation.name}</h2>
            <p className="sim-detail-desc">{simulation.description || 'No description provided.'}</p>
          </div>
          <div>
            <span className={`sim-tag sim-tag-${simulation.status.toLowerCase().replace(/_/g, '-')}`}>
              {simulation.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="sim-detail-grid">
          <div className="sim-detail-item">
            <span className="sim-detail-label">Simulation Type</span>
            <span className="sim-detail-value">{simulation.simulationType}</span>
          </div>
          <div className="sim-detail-item">
            <span className="sim-detail-label">Compute Nodes</span>
            <span className="sim-detail-value">{simulation.computeNodes} ({simulation.nodeSize})</span>
          </div>
          <div className="sim-detail-item">
            <span className="sim-detail-label">Priority</span>
            <span className="sim-detail-value">{simulation.priority}</span>
          </div>
          <div className="sim-detail-item">
            <span className="sim-detail-label">Created At</span>
            <span className="sim-detail-value">{formatDate(simulation.createdAt)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sim-detail-progress-section">
          <div className="sim-detail-progress-header">
            <span>Workload Execution Progress</span>
            <span className="sim-detail-progress-percent">{progressPercent}%</span>
          </div>
          <div className="sim-progress-bar" style={{ height: '10px' }}>
            <div 
              className="sim-progress-fill" 
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: simulation.status === 'COMPLETED_WITH_ERRORS' ? 'var(--status-warning)' : 'var(--primary)'
              }} 
            />
          </div>
        </div>

        {/* Job Metrics Breakdown */}
        <div className="sim-detail-counters">
          <div className="sim-counter-box">
            <span className="sim-counter-num">{totalJobsCount}</span>
            <span className="sim-counter-lbl">Total Jobs</span>
          </div>
          <div className="sim-counter-box">
            <span className="sim-counter-num" style={{ color: 'var(--text-tertiary)' }}>{queuedCount}</span>
            <span className="sim-counter-lbl">Queued</span>
          </div>
          <div className="sim-counter-box">
            <span className="sim-counter-num" style={{ color: 'var(--status-running)' }}>{runningCount}</span>
            <span className="sim-counter-lbl">Running</span>
          </div>
          <div className="sim-counter-box">
            <span className="sim-counter-num" style={{ color: 'var(--status-online)' }}>{completedCount}</span>
            <span className="sim-counter-lbl">Completed</span>
          </div>
          <div className="sim-counter-box">
            <span className="sim-counter-num" style={{ color: 'var(--status-offline)' }}>{failedCount}</span>
            <span className="sim-counter-lbl">Failed</span>
          </div>
        </div>
      </div>

      {/* Jobs List / Results Table */}
      <div className="sim-panel" style={{ marginTop: '1.5rem' }}>
        <div className="sim-panel-header">
          <h3 className="sim-panel-title">Jobs & Results Output</h3>
          <span className="sim-panel-badge">{jobs.length} Job Tasks</span>
        </div>

        <div className="sim-panel-body">
          {jobs.length === 0 ? (
            <div className="sim-empty-state">
              <p className="sim-empty-text">No jobs generated for this simulation yet.</p>
            </div>
          ) : (
            <table className="sim-table">
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Exec Time</th>
                  <th>Result / Output</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="font-mono">JOB-#{String(job.jobNumber).padStart(4, '0')}</td>
                    <td>
                      <span className={`sim-tag sim-tag-${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ width: '140px' }}>
                      <div className="sim-metric" style={{ gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem' }}>{job.progress}%</span>
                        <div className="sim-progress-bar">
                          <div className="sim-progress-fill" style={{ width: `${job.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {job.executionTime !== null ? `${job.executionTime}s` : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {job.errorMessage ? (
                        <span style={{ color: 'var(--status-offline)' }}>{job.errorMessage}</span>
                      ) : job.result ? (
                        <span style={{ color: '#a5f3fc', fontFamily: 'monospace' }}>{job.result}</span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>Waiting for execution...</span>
                      )}
                    </td>
                    <td>
                      {(job.status === 'QUEUED' || job.status === 'RUNNING') && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleCancelJob(job.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
