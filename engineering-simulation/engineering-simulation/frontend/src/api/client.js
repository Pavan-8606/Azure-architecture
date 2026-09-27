/**
 * API Client helper for backend communication.
 * All HTTP requests to the Flask API pass through this module.
 */

export async function fetchHealthStatus() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createSimulation(simulationData) {
  try {
    const response = await fetch('/api/simulations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function fetchSimulations() {
  try {
    const response = await fetch('/api/simulations');
    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function fetchSimulationById(id) {
  try {
    const response = await fetch(`/api/simulations/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function startSimulation(simulationId) {
  try {
    const response = await fetch(`/api/simulations/${simulationId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function fetchSimulationJobs(simulationId) {
  try {
    const response = await fetch(`/api/simulations/${simulationId}/jobs`);
    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function fetchAllJobs() {
  try {
    const response = await fetch('/api/jobs');
    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}

export async function cancelJob(jobId) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || `Server error (${response.status})` 
      };
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error or backend server unreachable.' 
    };
  }
}
