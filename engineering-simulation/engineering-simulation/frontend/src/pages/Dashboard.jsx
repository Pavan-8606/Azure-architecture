import React from 'react';
import StatCard from '../components/StatCard';
import ActivityPanel from '../components/ActivityPanel';
import NodeStatus from '../components/NodeStatus';
import '../styles/dashboard.css';

export default function Dashboard({ 
  simulations = [], 
  allJobs = [], 
  onSelectSimulation, 
  onStartSimulation 
}) {
  // Calculate job counts from allJobs
  const runningCount = allJobs.filter(j => j.status === 'RUNNING').length;
  const completedCount = allJobs.filter(j => j.status === 'COMPLETED').length;
  const failedCount = allJobs.filter(j => j.status === 'FAILED').length;

  const totalJobsCount = allJobs.length > 0 
    ? allJobs.length 
    : simulations.reduce((sum, sim) => sum + (sim.numberOfJobs || 0), 0);

  const stats = {
    total: totalJobsCount,
    running: runningCount,
    completed: completedCount,
    failed: failedCount,
  };

  return (
    <div className="sim-dashboard-page">
      {/* Metrics Row */}
      <section className="sim-stats-grid">
        <StatCard 
          label="Total Jobs" 
          value={stats.total} 
          type="total"
          icon="📊"
        />
        <StatCard 
          label="Running" 
          value={stats.running} 
          type="running"
          icon="⚡"
        />
        <StatCard 
          label="Completed" 
          value={stats.completed} 
          type="completed"
          icon="✅"
        />
        <StatCard 
          label="Failed" 
          value={stats.failed} 
          type="failed"
          icon="⚠️"
        />
      </section>

      {/* Main Grid: Activity Panel & Compute Nodes Panel */}
      <section className="sim-main-grid">
        <div className="sim-grid-column">
          <ActivityPanel 
            activities={simulations} 
            onSelectSimulation={onSelectSimulation}
            onStartSimulation={onStartSimulation}
          />
        </div>
        <div className="sim-grid-column">
          <NodeStatus 
            activeRunningCount={runningCount} 
            simulations={simulations} 
          />
        </div>
      </section>
    </div>
  );
}
