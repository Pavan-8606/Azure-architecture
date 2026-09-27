import React from 'react';
import Button from './Button';
import '../styles/header.css';

export default function Header({ 
  title = 'Dashboard', 
  description = 'Monitor and manage engineering simulation workloads',
  isBackendConnected = false,
  onNewSimulation
}) {
  return (
    <header className="sim-header">
      <div className="sim-header-left">
        <h1 className="sim-header-title">{title}</h1>
        <p className="sim-header-desc">{description}</p>
      </div>

      <div className="sim-header-right">
        <div className="sim-system-status">
          <span 
            className={`sim-status-dot ${isBackendConnected ? 'online' : 'offline'}`}
          />
          <span className="sim-status-text">
            {isBackendConnected ? 'System Online' : 'Backend Offline'}
          </span>
        </div>

        <Button 
          variant="primary" 
          size="md" 
          icon="+" 
          onClick={onNewSimulation}
        >
          New Simulation
        </Button>
      </div>
    </header>
  );
}
