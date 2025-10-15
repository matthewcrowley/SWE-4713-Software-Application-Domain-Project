import React from 'react';
import { Button } from '@mui/material';
import './eventlog.css';
import logo from "../assets/sweetledger.jpeg";
import { useNavigate } from 'react-router-dom';

const Chartofaccounts = () => {
  const navigate = useNavigate();

  // ===== State Variables =====
  const [accounts, setAccounts] = useState([]);     // Real data from backend
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // ===== Fetch Accounts from MongoDB Backend =====
  useEffect(() => {
    fetch('/api/accounts') // Hopefully this in our backend
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setAccounts(data);
      })
      .catch(err => console.error('Error loading accounts:', err));
  }, []);

  // ===== Handlers =====
  const handleBackToDashboard = () => {
    navigate('/administrator');
  };

  const handleGenerateReport = () => {
    // Generate report logic
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
