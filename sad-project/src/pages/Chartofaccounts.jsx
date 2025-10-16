import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableHead, TableBody, TableRow, TableCell,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import './chartofaccounts.css';
import logo from "../assets/sweetledger.jpeg";
import { useNavigate } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';

const Chartofaccounts = () => {
  const navigate = useNavigate();

  // ===== State Variables =====
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // ===== Fetch Accounts from MongoDB Backend =====
  useEffect(() => {
    fetch('/api/accounts')
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
    setOpenReport(true);
  };

  const handleCloseReport = () => {
    setOpenReport(false);
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredAccounts([]);
      return;
    }

    const results = accounts.filter(acc => {
      switch(filterType) {
        case 'number':
          return acc.number?.toLowerCase().includes(query);
        case 'name':
          return acc.name?.toLowerCase().includes(query);
        case 'type':
          return acc.type?.toLowerCase().includes(query);
        case 'category':
          return acc.category?.toLowerCase().includes(query);
        case 'subcategory':
          return acc.subcategory?.toLowerCase().includes(query);
        case 'balance': {
          // Search by balance (allows searching for amounts)
          const balance = acc.balance?.toString() || '0';
          return balance.includes(query.replace(/[,$]/g, ''));
        }
        case 'all':
        default:
          // Search across all fields
          return (
            acc.number?.toLowerCase().includes(query) ||
            acc.name?.toLowerCase().includes(query) ||
            acc.type?.toLowerCase().includes(query) ||
            acc.category?.toLowerCase().includes(query) ||
            acc.subcategory?.toLowerCase().includes(query) ||
            acc.balance?.toString().includes(query.replace(/[,$]/g, ''))
          );
      }
    });
    setFilteredAccounts(results);
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedAccount(null);
  };

  // Handle Enter key press in search field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="admin-container">
      {/* ===== Header ===== */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={logo} 
            alt="Sweet Ledger Logo" 
            className="header-logo"
          />
          <h1 className="admin-title">Chart of Accounts</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar />
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
            <HelpButton />
          </div>
        </div>
      </header>

      {/* ===== Main Section ===== */}
      <div className="admin-section">
        <h2>Search and Filter Accounts</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <FormControl size="small" style={{ minWidth: '180px' }}>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={filterType}
              label="Filter By"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="number">Account Number</MenuItem>
              <MenuItem value="name">Account Name</MenuItem>
              <MenuItem value="type">Type</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="subcategory">Subcategory</MenuItem>
              <MenuItem value="balance">Balance/Amount</MenuItem>
            </Select>
          </FormControl>
          
          <TextField 
            label="Search" 
            variant="outlined" 
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={filterType === 'all' ? 'Search all fields...' : `Search by ${filterType}...`}
            style={{ flex: 1, minWidth: '250px' }}
          />
          
          <Button 
            variant="contained" 
            className="btn" 
            onClick={handleSearch}
          >
            Search
          </Button>
          
          {filteredAccounts.length > 0 && (
            <Button 
              variant="outlined" 
              className="btn-clear" 
              onClick={() => {
                setSearchQuery('');
                setFilteredAccounts([]);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* ===== Search Results ===== */}
        {filteredAccounts.length > 0 ? (
          <>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Found {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
            </p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Account Number</strong></TableCell>
                  <TableCell><strong>Account Name</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Subcategory</strong></TableCell>
                  <TableCell><strong>Balance</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((acc, index) => (
                  <TableRow key={index}>
                    <TableCell>{acc.number}</TableCell>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>{acc.type}</TableCell>
                    <TableCell>{acc.category || 'N/A'}</TableCell>
                    <TableCell>{acc.subcategory || 'N/A'}</TableCell>
                    <TableCell>${acc.balance?.toLocaleString() ?? '0.00'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(acc)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : searchQuery ? (
          <p>No accounts found matching "{searchQuery}" in {filterType === 'all' ? 'any field' : filterType}.</p>
        ) : (
          <p>Select a filter type and enter a search term to find accounts.</p>
        )}
      </div>

      {/* ===== All Accounts Report Dialog ===== */}
      <Dialog open={openReport} onClose={handleCloseReport} maxWidth="lg" fullWidth>
        <DialogTitle>All Accounts Report</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Account Number</strong></TableCell>
                <TableCell><strong>Account Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Subcategory</strong></TableCell>
                <TableCell><strong>Balance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc, index) => (
                <TableRow key={index}>
                  <TableCell>{acc.number}</TableCell>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>{acc.type}</TableCell>
                  <TableCell>{acc.category || 'N/A'}</TableCell>
                  <TableCell>{acc.subcategory || 'N/A'}</TableCell>
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
              <p><strong>Category:</strong> {selectedAccount.category || 'N/A'}</p>
              <p><strong>Subcategory:</strong> {selectedAccount.subcategory || 'N/A'}</p>
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