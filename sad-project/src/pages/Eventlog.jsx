import React from 'react';
import { Button } from '@mui/material';
import './eventlog.css';

import { useNavigate } from 'react-router-dom';

const Eventlog = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    // Get the user role from sessionStorage
    const userRole = sessionStorage.getItem('userRole');
    
    // Navigate based on role
    if (userRole === 'administrator') {
      navigate('/administrator');
    } else if (userRole === 'manager') {
      navigate('/manager');
    } else if (userRole === 'regularuser') {
      navigate('/regularaccountuser');
    } else {
      // Default fallback to administrator if no role found
      navigate('/administrator');
    }
  };

  const handleGenerateReport = () => {
    // Generate report logic
    console.log('Generating report...');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="admin-title">Event Log</h1>
        </div>
        
        <div className="header-actions">
          <Button 
            className="back-to-dashboard-btn" 
            onClick={handleBackToDashboard}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          <Button 
            className="generate-report-btn" 
            onClick={handleGenerateReport}
            variant="contained"
          >
            Generate Expired Passwords Report
          </Button>
        </div>
      </header>

      <div className="admin-section">
        <h2>Event Log</h2>
        <p>Manage your events here.</p>
      </div>
    </div>
  );
};

export default Eventlog;