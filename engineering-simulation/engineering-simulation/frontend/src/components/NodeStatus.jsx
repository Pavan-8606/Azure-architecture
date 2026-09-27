import React from 'react';
import '../styles/activity.css';

export default function NodeStatus({ activeRunningCount = 0, simulations = [] }) {
  // Calculate total allocated compute nodes from running simulations
  const runningSims = simulations.filter(s => s.status === 'RUNNING');
  const totalAllocatedNodes = runningSims.reduce((sum, s) => sum + (s.computeNodes || 0), 0);
  
  // Generate active node objects
  const displayNodes = [];
  const nodeCountToDisplay = totalAllocatedNodes > 0 ? totalAllocatedNodes : (simulations.length > 0 ? 3 : 0);

  for (let i = 1; i <= Math.min(nodeCountToDisplay, 6); i++) {
    const isBusy = activeRunningCount > 0 && i <= Math.min(activeRunningCount, nodeCountToDisplay);
    displayNodes.push({
      id: `NODE-00${i}`,
      state: isBusy ? 'RUNNING' : 'IDLE',
      cpu: isBusy ? Math.floor(65 + Math.random() * 30) : 0,
      memory: isBusy ? Math.floor(40 + Math.random() * 35) : 5,
    });
  }

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <h3 className="sim-panel-title">Compute Nodes Pool</h3>
        <span className="sim-panel-badge">{displayNodes.length} Allocated Nodes</span>
      </div>

      <div className="sim-panel-body">
        {displayNodes.length === 0 ? (
          <div className="sim-empty-state">
            <div className="sim-empty-icon">💻</div>
            <h4 className="sim-empty-title">Compute Pool Idle</h4>
            <p className="sim-empty-text">
              Compute nodes will automatically provision and allocate tasks when simulation jobs are submitted.
            </p>
          </div>
        ) : (
          <div className="sim-nodes-grid">
            {displayNodes.map((node) => (
              <div key={node.id} className="sim-node-card">
                <div className="sim-node-header">
                  <span className="sim-node-id">{node.id}</span>
                  <span className={`sim-tag sim-tag-${node.state.toLowerCase()}`}>
                    {node.state}
                  </span>
                </div>
                <div className="sim-node-metrics">
                  <div className="sim-metric">
                    <span>CPU Usage ({node.cpu}%)</span>
                    <div className="sim-progress-bar">
                      <div 
                        className="sim-progress-fill" 
                        style={{ 
                          width: `${node.cpu}%`,
                          backgroundColor: node.state === 'RUNNING' ? 'var(--status-running)' : 'var(--border-muted)'
                        }} 
                      />
                    </div>
                  </div>
                  <div className="sim-metric">
                    <span>RAM Usage ({node.memory}%)</span>
                    <div className="sim-progress-bar">
                      <div className="sim-progress-fill" style={{ width: `${node.memory}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
