import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import './eventlog.css';

import { useNavigate } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';

const Chartofaccounts = () => {
  const navigate = useNavigate();

  // ===== State Variables =====
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // ===== Hard-coded accounts data =====
  const accounts = [
    { id: '1001', number: '1001', name: 'Cash', type: 'Asset', balance: 10000 },
    { id: '2001', number: '2001', name: 'Accounts Receivable', type: 'Asset', balance: 5000 },
    { id: '3001', number: '3001', name: 'Revenue', type: 'Income', balance: 15000 },
    { id: '4001', number: '4001', name: 'Expenses', type: 'Expense', balance: 3000 },
  ];

  // ===== Handlers =====
  const handleBackToDashboard = () => {
    navigate('/administrator');
  };

  const handleGenerateReport = () => {
    setOpenReport(true);
    console.log('Generating report...');
  };

  const handleCloseReport = () => {
    setOpenReport(false);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setOpenDetails(true);
  };

  return (
    <div className="admin-container">
      <HelpButton />
      <header className="admin-header">
        <Calendar />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        
        {/* Account List */}
        <div style={{ marginTop: '2rem' }}>
          {accounts.map((account) => (
            <div 
              key={account.id}
              style={{
                padding: '1rem',
                margin: '0.5rem 0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                color: '#000'
              }}
              onClick={() => handleAccountClick(account)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <strong>{account.number}</strong> - {account.name} ({account.type})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chartofaccounts;