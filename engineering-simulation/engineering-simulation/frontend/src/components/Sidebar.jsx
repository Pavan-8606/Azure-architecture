import React from 'react';
import '../styles/sidebar.css';

export default function Sidebar({ activeNav = 'dashboard', onNavSelect }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'simulations', label: 'Simulations', icon: '⚡' },
    { id: 'jobs', label: 'Jobs', icon: '📑' },
    { id: 'nodes', label: 'Compute Nodes', icon: '🖥️' },
    { id: 'results', label: 'Results', icon: '📈' },
  ];

  return (
    <aside className="sim-sidebar">
      <div className="sim-sidebar-brand">
        <div className="sim-logo-icon">S</div>
        <div className="sim-brand-text">
          <span className="sim-brand-title">SimFlow</span>
          <span className="sim-brand-subtitle">Engineering Workloads</span>
        </div>
      </div>

      <nav className="sim-sidebar-nav">
        <ul className="sim-nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="sim-nav-item">
              <button
                className={`sim-nav-link ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => onNavSelect && onNavSelect(item.id)}
              >
                <span className="sim-nav-icon">{item.icon}</span>
                <span className="sim-nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sim-sidebar-footer">
        <div className="sim-version-badge">Phase 1 • Local Engine</div>
      </div>
    </aside>
  );
}
