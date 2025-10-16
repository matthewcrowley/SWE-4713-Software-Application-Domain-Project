import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  TextField,
  InputAdornment,
} from '@mui/material';
import './eventlog.css';
import { useNavigate } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';

const Chartofaccounts = () => {
  const navigate = useNavigate();

  // ===== State Variables =====
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ===== Fetch Accounts =====
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/accounts');
      const data = await response.json();
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // ===== Filtered Accounts =====
  const filteredAccounts = accounts.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.accountNumber.toLowerCase().includes(searchLower) ||
      account.accountName.toLowerCase().includes(searchLower)
    );
  });

  // ===== Handlers =====
  const handleBackToDashboard = () => {
    navigate('/administrator');
  };

  const handleGenerateReport = () => {
    setOpenReport(true);
  };

  const handleCloseReport = () => {
    setOpenReport(false);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedAccount(null);
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setOpenDetails(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
            Generate Full Report
          </Button>
        </div>
      </header>

      <div className="admin-section">
        <h2>Chart of Accounts</h2>
        
        {/* Search Bar */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by account number or name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Results Count */}
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          {filteredAccounts.length === accounts.length 
            ? `Showing all ${accounts.length} accounts`
            : `Found ${filteredAccounts.length} of ${accounts.length} accounts`}
        </p>
        
        {/* Account List */}
        <div style={{ marginTop: '1rem' }}>
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '1rem',
                  margin: '0.5rem 0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#000',
                  backgroundColor: 'white'
                }}
                onClick={() => handleAccountClick(account)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{account.accountNumber}</strong> - {account.accountName}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: '#e3f2fd', 
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {account.category}
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: '#f3e5f5', 
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      ${parseFloat(account.balance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#666',
              border: '1px dashed #ddd',
              borderRadius: '4px'
            }}>
              No accounts found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* ===== ACCOUNT DETAILS DIALOG ===== */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Account Details</DialogTitle>
        <DialogContent>
          {selectedAccount && (
            <div style={{ padding: '1rem 0' }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Account Number</strong></TableCell>
                    <TableCell>{selectedAccount.accountNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Account Name</strong></TableCell>
                    <TableCell>{selectedAccount.accountName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell>{selectedAccount.category}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Subcategory</strong></TableCell>
                    <TableCell>{selectedAccount.subcategory}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Normal Side</strong></TableCell>
                    <TableCell>{selectedAccount.normalSide}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Current Balance</strong></TableCell>
                    <TableCell>${parseFloat(selectedAccount.balance || 0).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Initial Balance</strong></TableCell>
                    <TableCell>${parseFloat(selectedAccount.initialBalance || 0).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Debit</strong></TableCell>
                    <TableCell>${parseFloat(selectedAccount.debit || 0).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Credit</strong></TableCell>
                    <TableCell>${parseFloat(selectedAccount.credit || 0).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Statement</strong></TableCell>
                    <TableCell>
                      {selectedAccount.statement === 'IS' ? 'Income Statement' : 
                       selectedAccount.statement === 'BS' ? 'Balance Sheet' : 
                       selectedAccount.statement === 'RE' ? 'Retained Earnings' : 
                       selectedAccount.statement}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell>{selectedAccount.description || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Comment</strong></TableCell>
                    <TableCell>{selectedAccount.comment || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Order</strong></TableCell>
                    <TableCell>{selectedAccount.order || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date Added</strong></TableCell>
                    <TableCell>
                      {selectedAccount.dateAdded ? 
                        new Date(selectedAccount.dateAdded).toLocaleDateString() : 
                        'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== FULL REPORT DIALOG ===== */}
      <Dialog 
        open={openReport} 
        onClose={handleCloseReport}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Chart of Accounts - Full Report</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Account #</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Subcategory</strong></TableCell>
                <TableCell><strong>Normal Side</strong></TableCell>
                <TableCell><strong>Balance</strong></TableCell>
                <TableCell><strong>Statement</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account, idx) => (
                <TableRow key={idx}>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.category}</TableCell>
                  <TableCell>{account.subcategory}</TableCell>
                  <TableCell>{account.normalSide}</TableCell>
                  <TableCell>${parseFloat(account.balance || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {account.statement === 'IS' ? 'Income Statement' : 
                     account.statement === 'BS' ? 'Balance Sheet' : 
                     account.statement === 'RE' ? 'Retained Earnings' : 
                     account.statement}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReport} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Chartofaccounts;