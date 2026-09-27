import React from 'react';
import '../styles/statcard.css';

export default function StatCard({ label, value = 0, type = 'default', icon }) {
  return (
    <div className={`sim-stat-card sim-stat-${type}`}>
      <div className="sim-stat-header">
        <span className="sim-stat-label">{label}</span>
        {icon && <span className="sim-stat-icon">{icon}</span>}
      </div>
      <div className="sim-stat-value">{value}</div>
    </div>
  );
}
