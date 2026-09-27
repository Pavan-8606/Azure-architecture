import React, { useState } from 'react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { createSimulation } from '../api/client';
import '../styles/forms.css';

export default function CreateSimulation({ onCancel, onSubmitSuccess }) {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    simulationType: 'Structural Analysis',
    jobsCount: 10,
    duration: '5 minutes',
    priority: 'Normal',
    nodesCount: 3,
    nodeSize: 'Medium',
    enableParallel: true,
    saveResults: true,
  });

  // UI / Submission States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (backendError) {
      setBackendError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Simulation Name is required.';
    }

    const jobs = Number(formData.jobsCount);
    if (isNaN(jobs) || jobs < 1 || jobs > 300) {
      newErrors.jobsCount = 'Number of jobs must be between 1 and 300.';
    }

    const nodes = Number(formData.nodesCount);
    if (isNaN(nodes) || nodes < 1 || nodes > 10) {
      newErrors.nodesCount = 'Number of nodes must be between 1 and 10.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    setBackendError('');
    setConfirmation(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Payload formatted for backend POST /api/simulations
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      simulationType: formData.simulationType,
      numberOfJobs: Number(formData.jobsCount),
      durationPerJob: formData.duration,
      priority: formData.priority,
      computeNodes: Number(formData.nodesCount),
      nodeSize: formData.nodeSize,
      parallelExecution: formData.enableParallel,
      saveResults: formData.saveResults,
    };

    const response = await createSimulation(payload);

    setIsSubmitting(false);

    if (response.success) {
      setConfirmation({
        title: response.message || 'Simulation Created Successfully',
        message: `Simulation "${response.simulation.name}" (ID: ${response.simulation.id}) has been created in status "${response.simulation.status}".`
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(response.simulation);
      }
    } else {
      setBackendError(response.error || 'Failed to create simulation on backend.');
    }
  };

  return (
    <div className="sim-form-container">
      {confirmation && (
        <div className="sim-success-banner">
          <div className="sim-success-icon">✓</div>
          <div className="sim-success-content">
            <h4>{confirmation.title}</h4>
            <p>{confirmation.message}</p>
          </div>
        </div>
      )}

      {backendError && (
        <div className="sim-error-banner" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem 1.5rem',
          color: 'var(--status-offline)',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {backendError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Simulation Information */}
        <div className="sim-form-card">
          <div>
            <h3 className="sim-form-section-title">1. Simulation Information</h3>
            <p className="sim-form-section-desc">Basic details identifying the engineering workload</p>
          </div>

          <div className="sim-form-grid">
            <FormField 
              label="Simulation Name" 
              required 
              error={errors.name}
              className="sim-form-full"
            >
              <input 
                type="text" 
                className={`sim-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Turbine Blade Stress Analysis" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField 
              label="Simulation Type" 
              className="sim-form-full"
            >
              <select 
                className="sim-select"
                value={formData.simulationType}
                onChange={(e) => handleChange('simulationType', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Structural Analysis">Structural Analysis</option>
                <option value="Thermal Analysis">Thermal Analysis</option>
                <option value="Fluid Dynamics">Fluid Dynamics</option>
                <option value="General Engineering">General Engineering</option>
              </select>
            </FormField>

            <FormField 
              label="Description" 
              helpText="Optional summary of parameters, boundary conditions, or goals"
              className="sim-form-full"
            >
              <textarea 
                className="sim-textarea"
                placeholder="Enter simulation notes or domain specifications..." 
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Workload Configuration */}
        <div className="sim-form-card" style={{ marginTop: '1.5rem' }}>
          <div>
            <h3 className="sim-form-section-title">2. Workload Configuration</h3>
            <p className="sim-form-section-desc">Specify job count, estimated runtime, and execution priority</p>
          </div>

          <div className="sim-form-grid">
            <FormField 
              label="Number of Jobs" 
              required 
              error={errors.jobsCount}
              helpText="Accepts between 1 and 300 jobs"
            >
              <input 
                type="number" 
                min="1" 
                max="300" 
                className={`sim-input ${errors.jobsCount ? 'error' : ''}`}
                value={formData.jobsCount}
                onChange={(e) => handleChange('jobsCount', e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField 
              label="Estimated Duration Per Job" 
              helpText="Target execution time per task"
            >
              <select 
                className="sim-select"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="1 minute">1 minute</option>
                <option value="5 minutes">5 minutes</option>
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
              </select>
            </FormField>

            <FormField label="Priority" className="sim-form-full">
              <div className="sim-radio-group">
                {['Low', 'Normal', 'High'].map((p) => (
                  <label 
                    key={p} 
                    className={`sim-radio-label ${formData.priority === p ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="priority"
                      className="sim-radio-input"
                      checked={formData.priority === p}
                      onChange={() => handleChange('priority', p)}
                      disabled={isSubmitting}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 3: Compute Configuration */}
        <div className="sim-form-card" style={{ marginTop: '1.5rem' }}>
          <div>
            <h3 className="sim-form-section-title">3. Compute Configuration</h3>
            <p className="sim-form-section-desc">Configure target compute node pool for workload execution</p>
          </div>

          <div className="sim-form-grid">
            <FormField 
              label="Number of Compute Nodes" 
              required 
              error={errors.nodesCount}
              helpText="Accepts between 1 and 10 compute nodes"
            >
              <input 
                type="number" 
                min="1" 
                max="10" 
                className={`sim-input ${errors.nodesCount ? 'error' : ''}`}
                value={formData.nodesCount}
                onChange={(e) => handleChange('nodesCount', e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Node Size" className="sim-form-full">
              <div className="sim-radio-group">
                {[
                  { id: 'Small', label: 'Small (2 vCPU, 4GB RAM)' },
                  { id: 'Medium', label: 'Medium (4 vCPU, 8GB RAM)' },
                  { id: 'Large', label: 'Large (8 vCPU, 16GB RAM)' },
                ].map((n) => (
                  <label 
                    key={n.id} 
                    className={`sim-radio-label ${formData.nodeSize === n.id ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="nodeSize"
                      className="sim-radio-input"
                      checked={formData.nodeSize === n.id}
                      onChange={() => handleChange('nodeSize', n.id)}
                      disabled={isSubmitting}
                    />
                    <span>{n.label}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 4: Advanced Options */}
        <div className="sim-form-card" style={{ marginTop: '1.5rem' }}>
          <div>
            <h3 className="sim-form-section-title">4. Advanced Options</h3>
            <p className="sim-form-section-desc">Execution parameters and output settings</p>
          </div>

          <div className="sim-checkbox-group">
            <label className={`sim-checkbox-label ${formData.enableParallel ? 'selected' : ''}`}>
              <input 
                type="checkbox" 
                className="sim-checkbox-input"
                checked={formData.enableParallel}
                onChange={(e) => handleChange('enableParallel', e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Enable parallel execution across compute nodes</span>
            </label>

            <label className={`sim-checkbox-label ${formData.saveResults ? 'selected' : ''}`}>
              <input 
                type="checkbox" 
                className="sim-checkbox-input"
                checked={formData.saveResults}
                onChange={(e) => handleChange('saveResults', e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Save simulation output results to storage</span>
            </label>
          </div>
        </div>

        {/* Section 5: Bottom Action Area */}
        <div className="sim-form-actions" style={{ marginTop: '1.75rem' }}>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Simulation...' : 'Create Simulation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
