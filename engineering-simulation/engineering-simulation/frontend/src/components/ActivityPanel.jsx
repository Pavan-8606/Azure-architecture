import React from 'react';
import Button from './Button';
import '../styles/activity.css';

export default function ActivityPanel({ activities = [], onSelectSimulation, onStartSimulation }) {
  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <h3 className="sim-panel-title">Recent Simulation Activity</h3>
        <span className="sim-panel-badge">{activities.length} Workloads</span>
      </div>

      <div className="sim-panel-body">
        {activities.length === 0 ? (
          <div className="sim-empty-state">
            <div className="sim-empty-icon">📁</div>
            <h4 className="sim-empty-title">No simulation activity yet</h4>
            <p className="sim-empty-text">
              Submitted simulation workloads will appear here once created. Click "New Simulation" to start your first run.
            </p>
          </div>
        ) : (
          <table className="sim-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Jobs</th>
                <th>Nodes</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr 
                  key={item.id} 
                  className="sim-table-row-clickable" 
                  onClick={() => onSelectSimulation && onSelectSimulation(item.id)}
                >
                  <td className="font-mono">SIM-#{String(item.id).padStart(4, '0')}</td>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>{item.simulationType}</div>
                  </td>
                  <td>
                    <span className={`sim-tag sim-tag-${item.status.toLowerCase().replace(/_/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.numberOfJobs}</td>
                  <td>{item.computeNodes}</td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    {formatDate(item.createdAt)}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {item.status === 'CREATED' ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => onStartSimulation && onStartSimulation(item.id)}
                      >
                        ▶ Start
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => onSelectSimulation && onSelectSimulation(item.id)}
                      >
                        Details
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
  );
}
