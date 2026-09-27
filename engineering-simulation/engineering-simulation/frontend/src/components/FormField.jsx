import React from 'react';
import '../styles/forms.css';

export default function FormField({ 
  label, 
  required = false, 
  error = '', 
  helpText = '', 
  children,
  className = ''
}) {
  return (
    <div className={`sim-field ${className}`}>
      {label && (
        <label className="sim-label">
          <span>{label} {required && <span className="sim-label-required">*</span>}</span>
        </label>
      )}
      {children}
      {error ? (
        <span className="sim-error-msg">{error}</span>
      ) : helpText ? (
        <span className="sim-help-text">{helpText}</span>
      ) : null}
    </div>
  );
}
