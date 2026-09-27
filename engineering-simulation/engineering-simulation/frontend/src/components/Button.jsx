import React from 'react';
import '../styles/button.css';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon = null, 
  disabled = false,
  className = ''
}) {
  return (
    <button 
      className={`sim-btn sim-btn-${variant} sim-btn-${size} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {icon && <span className="sim-btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
