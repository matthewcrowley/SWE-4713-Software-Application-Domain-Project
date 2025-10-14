import React from 'react';
import {Button, List, ListItem, ListItemText} from '@mui/material';
import './eventlog.css';
import {useNavigate} from 'react-router-dom';
import logo from "../assets/sweetledger.jpeg";

const Chartofaccounts = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/administrator');
  };

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const accounts = [
    { id: '1001', name: 'Cash' },
    { id: '2001', name: 'Accounts Receivable' },
    { id: '3001', name: 'Revenue' },
    { id: '4001', name: 'Expenses' },
  ];

  const handleAccountClick = (accountId) => {
    navigate(`/ledger/${accountId}`);
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
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

        <List>
          {accounts.map((account) => (
            <ListItem 
              key={account.id} 
              button 
              onClick={() => handleAccountClick(account.id)}
              sx={{ 
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <ListItemText 
                primary={<span style={{ color: 'black' }}>{account.name}</span>}
                secondary={
                  <>
                    Account Number:&nbsp;
                    <span
                      onClick={() => handleAccountClick(account.id)}
                      style={{
                        color: '#1976d2',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {account.id}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Chartofaccounts;