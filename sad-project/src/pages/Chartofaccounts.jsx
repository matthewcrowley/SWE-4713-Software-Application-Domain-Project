import React from 'react';
import { Button } from '@mui/material';
import './eventlog.css';
import logo from "../assets/sweetledger.jpeg";

import { useNavigate } from 'react-router-dom';

const Chartofaccounts = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/administrator');
  };

  const handleGenerateReport = () => {
    // Generate report logic
    console.log('Generating report...');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="Sweet Ledger Logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
          <h1 className="admin-title">Chart of Accounts</h1>
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
        <h2>Chart of Accounts</h2>
        <p>Manage your accounts here.</p>
      </div>
    </div>
  );
};

export default Chartofaccounts;