import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CreateSimulation from './pages/CreateSimulation';
import SimulationDetail from './pages/SimulationDetail';
import Button from './components/Button';
import { fetchHealthStatus, fetchSimulations, fetchAllJobs, startSimulation } from './api/client';
import './App.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedSimulationId, setSelectedSimulationId] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [simulations, setSimulations] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  // Poll backend health status (/api/health)
  useEffect(() => {
    const checkConnection = async () => {
      const result = await fetchHealthStatus();
      setIsBackendConnected(result.success);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch simulations & jobs data
  const loadData = useCallback(async () => {
    const [simsRes, jobsRes] = await Promise.all([
      fetchSimulations(),
      fetchAllJobs()
    ]);

    if (simsRes.success && Array.isArray(simsRes.simulations)) {
      setSimulations(simsRes.simulations);
    }
    if (jobsRes.success && Array.isArray(jobsRes.jobs)) {
      setAllJobs(jobsRes.jobs);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-polling every 2 seconds while any simulation or job is RUNNING
  useEffect(() => {
    const hasRunningSim = simulations.some(s => s.status === 'RUNNING');
    const hasRunningJob = allJobs.some(j => j.status === 'RUNNING');

    if (!hasRunningSim && !hasRunningJob) return;

    const pollInterval = setInterval(() => {
      loadData();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [simulations, allJobs, loadData]);

  const handleStartSimulation = async (simId) => {
    const res = await startSimulation(simId);
    if (res.success) {
      loadData();
    }
  };

  const handleOpenDetail = (simId) => {
    setSelectedSimulationId(simId);
    setActiveNav('simulation-detail');
  };

  const getPageDetails = () => {
    switch (activeNav) {
      case 'dashboard':
        return { title: 'Dashboard', desc: 'Monitor and manage engineering simulation workloads' };
      case 'create-simulation':
        return { title: 'Create Simulation', desc: 'Configure and submit an engineering simulation workload.' };
      case 'simulation-detail':
        return { title: 'Simulation Workload Details', desc: 'Real-time job execution telemetry and engineering results' };
      case 'simulations':
        return { title: 'Simulations', desc: 'View and manage multi-job engineering simulations' };
      case 'jobs':
        return { title: 'Jobs Queue', desc: 'Track job batch status, execution time, and retry logs' };
      case 'nodes':
        return { title: 'Compute Nodes', desc: 'Monitor node pool utilization and provisioning' };
      case 'results':
        return { title: 'Results & Analytics', desc: 'Visualize output data and engineering metrics' };
      default:
        return { title: 'Dashboard', desc: 'SimFlow Engineering Simulation Dashboard' };
    }
  };

  const pageDetails = getPageDetails();

  return (
    <div className="sim-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeNav={activeNav === 'simulation-detail' ? 'simulations' : activeNav} 
        onNavSelect={(navId) => {
          setSelectedSimulationId(null);
          setActiveNav(navId);
        }} 
      />

      {/* Main Content Area */}
      <div className="sim-app-main">
        <Header 
          title={pageDetails.title}
          description={pageDetails.desc}
          isBackendConnected={isBackendConnected}
          onNewSimulation={() => {
            setSelectedSimulationId(null);
            setActiveNav('create-simulation');
          }}
        />

        <main className="sim-app-content">
          {activeNav === 'dashboard' ? (
            <Dashboard 
              simulations={simulations}
              allJobs={allJobs}
              onSelectSimulation={handleOpenDetail}
              onStartSimulation={handleStartSimulation}
            />
          ) : activeNav === 'create-simulation' ? (
            <CreateSimulation 
              onCancel={() => setActiveNav('dashboard')}
              onSubmitSuccess={(createdSim) => {
                loadData();
                if (createdSim && createdSim.id) {
                  setSelectedSimulationId(createdSim.id);
                  setActiveNav('simulation-detail');
                }
              }}
            />
          ) : activeNav === 'simulation-detail' && selectedSimulationId ? (
            <SimulationDetail 
              simulationId={selectedSimulationId}
              onBack={() => {
                setSelectedSimulationId(null);
                setActiveNav('dashboard');
              }}
            />
          ) : (
            <div className="sim-placeholder-view">
              <div className="sim-placeholder-card">
                <div className="sim-placeholder-icon">🛠️</div>
                <h2>{pageDetails.title}</h2>
                <p>{pageDetails.desc}</p>
                <div style={{ marginTop: '1.5rem' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveNav('dashboard')}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
