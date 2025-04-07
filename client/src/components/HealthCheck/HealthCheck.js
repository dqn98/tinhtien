import React, { useState } from 'react';
import apiService from '../../services/api';
import './HealthCheck.css';

const HealthCheck = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkServerHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.checkHealth();
      setStatus(response.data);
    } catch (err) {
      setError('Failed to connect to server: ' + (err.response?.data?.message || err.message));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-check-container">
      <button 
        className="health-check-button" 
        onClick={checkServerHealth}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Server Health'}
      </button>
      
      {status && (
        <div className="health-status success">
          <h4>Server Status: {status.status}</h4>
          <p>{status.message}</p>
          {status.database && (
            <p>Database: {typeof status.database === 'object' ? status.database.status : status.database}</p>
          )}
        </div>
      )}
      
      {error && (
        <div className="health-status error">
          <h4>Connection Error</h4>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;