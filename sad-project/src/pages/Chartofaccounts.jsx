import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import './eventlog.css';
import logo from "../assets/sweetledger.jpeg";
import { useNavigate } from 'react-router-dom';

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
      {/* ===== Header ===== */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={logo} 
            alt="Sweet Ledger Logo" 
            style={{ height: '50px', width: '50px', objectFit: 'contain' }} 
          />
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
            View All Accounts Report
          </Button>
        </div>
      </header>

      {/* ===== Main Section ===== */}
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

      {/* ===== All Accounts Report Dialog ===== */}
      <Dialog open={openReport} onClose={handleCloseReport} maxWidth="md" fullWidth>
        <DialogTitle>All Accounts Report</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Account Number</strong></TableCell>
                <TableCell><strong>Account Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Balance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc, index) => (
                <TableRow key={index}>
                  <TableCell>{acc.number}</TableCell>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>{acc.type}</TableCell>
                  <TableCell>${acc.balance?.toLocaleString() ?? '0.00'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReport} className="btn cancel">Close</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Individual Account Details Dialog ===== */}
      <Dialog open={openDetails} onClose={handleCloseDetails}>
        <DialogTitle>Account Details</DialogTitle>
        <DialogContent>
          {selectedAccount && (
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Account Number:</strong> {selectedAccount.number}</p>
              <p><strong>Account Name:</strong> {selectedAccount.name}</p>
              <p><strong>Type:</strong> {selectedAccount.type}</p>
              <p><strong>Current Balance:</strong> ${selectedAccount.balance?.toLocaleString() ?? '0.00'}</p>
              <p><strong>Status:</strong> Active</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} className="btn cancel">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Chartofaccounts;