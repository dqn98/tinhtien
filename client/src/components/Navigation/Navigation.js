import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HealthCheck from '../HealthCheck/HealthCheck';
import './Navigation.css';

const Navigation = () => {
  const [showHealthCheck, setShowHealthCheck] = useState(false);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          TinhTien
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Events</Link>
          <Link to="/members" className="nav-link">Members</Link>
          <button 
            className="nav-link health-toggle" 
            onClick={() => setShowHealthCheck(!showHealthCheck)}
          >
            {showHealthCheck ? 'Hide Health Check' : 'Show Health Check'}
          </button>
        </div>
      </div>
      {showHealthCheck && (
        <div className="health-check-wrapper">
          <HealthCheck />
        </div>
      )}
    </nav>
  );
};

export default Navigation;