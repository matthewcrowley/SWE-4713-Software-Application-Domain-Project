import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableHead, TableBody, TableRow, TableCell,
  MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Box
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
  const [accountEventLogs, setAccountEventLogs] = useState([]);
  const [openReport, setOpenReport] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortedAccounts, setSortedAccounts] = useState([]);

  // ===== Fetch Accounts from MongoDB Backend =====
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/accounts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch accounts');
        return res.json();
      })
      .then(data => {
        setAccounts(data);
        const sorted = [...data].sort((a,b) => Number(a.account_number) - Number(b.account_number));
        setSortedAccounts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading accounts:', err);
        setError('Failed to load accounts from database');
        setLoading(false);
      });
  }, []);


  // ===== Fetch Event Logs for Specific Account =====
  const fetchAccountEventLogs = async (accountId, accountNumber) => {
    setLogsLoading(true);
    try {
      // Fetch all event logs
      const response = await fetch('http://localhost:3000/api/eventlog');
      if (!response.ok) throw new Error('Failed to fetch event logs');
      const allLogs = await response.json();

      // Filter logs related to this specific account
      const accountLogs = allLogs.filter(log => {
        // Check if the log is related to this account by ID or account number
        if (log.accountId === accountId) return true;
        
        // Check in before/after data
        if (log.before && (
          log.before._id === accountId || 
          log.before.accountNumber === accountNumber
        )) return true;
        
        if (log.after && (
          log.after._id === accountId || 
          log.after.accountNumber === accountNumber
        )) return true;

        // Check if action mentions the account number
        if (log.action && log.action.includes(accountNumber)) return true;

        return false;
      });

      // Sort by timestamp (newest first)
      accountLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setAccountEventLogs(accountLogs);
    } catch (err) {
      console.error('Error loading event logs:', err);
      setAccountEventLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

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
          return acc.accountNumber?.toString().toLowerCase().includes(query);
        case 'name':
          return acc.accountName?.toLowerCase().includes(query);
        case 'type':
          return acc.normalSide?.toLowerCase().includes(query);
        case 'category':
          return acc.accountCategory?.toLowerCase().includes(query);
        case 'subcategory':
          return acc.accountSubcategory?.toLowerCase().includes(query);
        case 'balance': {
          const balance = acc.balance?.toString() || '0';
          return balance.includes(query.replace(/[,$]/g, ''));
        }
        case 'all':
        default:
          return (
            acc.accountNumber?.toString().toLowerCase().includes(query) ||
            acc.accountName?.toLowerCase().includes(query) ||
            acc.normalSide?.toLowerCase().includes(query) ||
            acc.accountCategory?.toLowerCase().includes(query) ||
            acc.accountSubcategory?.toLowerCase().includes(query) ||
            acc.balance?.toString().includes(query.replace(/[,$]/g, ''))
          );
      }
    });
    setFilteredAccounts(results);
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setDetailsTab(0);
    setOpenDetails(true);
    // Fetch event logs for this account
    fetchAccountEventLogs(account._id, account.accountNumber);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedAccount(null);
    setAccountEventLogs([]);
    setDetailsTab(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (event, newValue) => {
    setDetailsTab(newValue);
  };

  // ===== Render Before/After Comparison =====
  const renderBeforeAfterComparison = (log) => {
    if (!log.before && log.after) {
      // Account was created
      return (
        <div className="log-comparison">
          <div className="log-section log-after">
            <h4>Account Created</h4>
            <div className="log-details">
              {Object.entries(log.after).map(([key, value]) => {
                if (key === '_id' || key === '__v') return null;
                return (
                  <p key={key}>
                    <strong>{key}:</strong> {
                      typeof value === 'object' ? JSON.stringify(value) : 
                      value instanceof Date ? new Date(value).toLocaleString() :
                      String(value)
                    }
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (log.before && log.after) {
      // Account was modified
      const changedFields = [];
      const allKeys = new Set([...Object.keys(log.before || {}), ...Object.keys(log.after || {})]);
      
      allKeys.forEach(key => {
        if (key === '_id' || key === '__v' || key === 'updatedAt') return;
        const beforeVal = log.before[key];
        const afterVal = log.after[key];
        
        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
          changedFields.push(key);
        }
      });

      return (
        <div className="log-comparison">
          <div className="log-section log-before">
            <h4>Before</h4>
            <div className="log-details">
              {changedFields.map(key => (
                <p key={key} className="changed-field">
                  <strong>{key}:</strong> {
                    typeof log.before[key] === 'object' ? JSON.stringify(log.before[key]) : 
                    log.before[key] instanceof Date ? new Date(log.before[key]).toLocaleString() :
                    String(log.before[key] || 'N/A')
                  }
                </p>
              ))}
            </div>
          </div>
          <div className="log-section log-after">
            <h4>After</h4>
            <div className="log-details">
              {changedFields.map(key => (
                <p key={key} className="changed-field">
                  <strong>{key}:</strong> {
                    typeof log.after[key] === 'object' ? JSON.stringify(log.after[key]) : 
                    log.after[key] instanceof Date ? new Date(log.after[key]).toLocaleString() :
                    String(log.after[key] || 'N/A')
                  }
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (log.before && !log.after) {
      // Account was deleted
      return (
        <div className="log-comparison">
          <div className="log-section log-before">
            <h4>Account Deleted</h4>
            <div className="log-details">
              {Object.entries(log.before).map(([key, value]) => {
                if (key === '_id' || key === '__v') return null;
                return (
                  <p key={key}>
                    <strong>{key}:</strong> {
                      typeof value === 'object' ? JSON.stringify(value) : 
                      value instanceof Date ? new Date(value).toLocaleString() :
                      String(value)
                    }
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return <p>No data available</p>;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Chart of Accounts</h1>
        </header>
        <div className="admin-section">
          <p>Loading accounts...</p>
        </div>
      </div>
    );
  }

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
          <div className="header-actions">
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

       <nav className="dashboard-nav" style={{ backgroundColor: '#ebebeb75', borderBottom: '1px solid #ccc' }}>
        <div className="button-container">
            <Calendar title="Calander" />
            <span className="tooltiptext">Click here to open the calendar</span>
          </div>
          <button className="nav-button" onClick={() => navigate("/administrator")}>
            🏠 Dashboard
          </button>
          <button className="nav-button" onClick={() => navigate("/accountmanagement")}>
            👤 Accounts
          </button>
          <button className="nav-button" onClick={() => navigate("/chartofaccounts")}>
            📋 Chart
          </button>
          <button className="nav-button" onClick={() => navigate("/eventlog")}>
            📝 Event Log
          </button>
          <button className="nav-button" onClick={() => navigate("/journalentries")}>
            📖 Journal
          </button>
        </nav>


      {/* ===== Error Message ===== */}
      {error && (
        <div className="admin-section">
          <div className="error-message">{error}</div>
        </div>
      )}

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
              <MenuItem value="type">Normal Side</MenuItem>
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
                  <TableCell><strong>Normal Side</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Subcategory</strong></TableCell>
                  <TableCell><strong>Balance</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((acc) => (
                  <TableRow key={acc._id}>
                    <TableCell>{acc.accountNumber}</TableCell>
                    <TableCell>{acc.accountName}</TableCell>
                    <TableCell>{acc.normalSide}</TableCell>
                    <TableCell>{acc.accountCategory || 'N/A'}</TableCell>
                    <TableCell>{acc.accountSubcategory || 'N/A'}</TableCell>
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

      <div className="admin-section">
        <h2>Chart of Accounts</h2>
        <p>Manage your accounts here.</p>

        {loading ? (
          <p>Loading accounts...</p>
        ) : sortedAccounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <table className="account-table" border="1" cellPadding="8" style={{color: 'black'}}>
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account Name</th>
                <th>Account Type</th>
                <th>Subcategory</th>
                <th>Balance</th>
                <th>Created By</th>
                <th>Date Created</th>
                <th>Comments</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedAccounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.account_number}</td>
                  <td>{account.account_name}</td>
                  <td>{account.type}</td>
                  <td>{account.accountSubcategory}</td>
                  <td>{account.balance}</td>
                  <td>{account.created_by}</td>
                  <td>{account.timestamp}</td>
                  <td>{account.comments}</td>
                  <button style={{ backgroundColor: 'lightblue' , margin: '10px'}}>Edit</button>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
  );

      {/* ===== All Accounts Report Dialog ===== */}
      <Dialog open={openReport} onClose={handleCloseReport} maxWidth="lg" fullWidth>
        <DialogTitle>All Accounts Report</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Account Number</strong></TableCell>
                <TableCell><strong>Account Name</strong></TableCell>
                <TableCell><strong>Normal Side</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Subcategory</strong></TableCell>
                <TableCell><strong>Balance</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc._id}>
                  <TableCell>{acc.accountNumber}</TableCell>
                  <TableCell>{acc.accountName}</TableCell>
                  <TableCell>{acc.normalSide}</TableCell>
                  <TableCell>{acc.accountCategory || 'N/A'}</TableCell>
                  <TableCell>{acc.accountSubcategory || 'N/A'}</TableCell>
                  <TableCell>${acc.balance?.toLocaleString() ?? '0.00'}</TableCell>
                  <TableCell>{acc.isActive ? 'Active' : 'Inactive'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReport} className="btn cancel">Close</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Individual Account Details Dialog with Tabs ===== */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="lg" fullWidth>
        <DialogTitle>
          Account Details - {selectedAccount?.accountNumber} {selectedAccount?.accountName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
            <Tabs value={detailsTab} onChange={handleTabChange}>
              <Tab label="Account Information" />
              <Tab label={`Event Log History (${accountEventLogs.length})`} />
            </Tabs>
          </Box>

          {/* Tab 0: Account Information */}
          {detailsTab === 0 && selectedAccount && (
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Account Number:</strong> {selectedAccount.accountNumber}</p>
              <p><strong>Account Name:</strong> {selectedAccount.accountName}</p>
              <p><strong>Description:</strong> {selectedAccount.accountDescription || 'N/A'}</p>
              <p><strong>Normal Side:</strong> {selectedAccount.normalSide}</p>
              <p><strong>Category:</strong> {selectedAccount.accountCategory || 'N/A'}</p>
              <p><strong>Subcategory:</strong> {selectedAccount.accountSubcategory || 'N/A'}</p>
              <p><strong>Initial Balance:</strong> ${selectedAccount.initialBalance?.toLocaleString() ?? '0.00'}</p>
              <p><strong>Current Balance:</strong> ${selectedAccount.balance?.toLocaleString() ?? '0.00'}</p>
              <p><strong>Debit:</strong> ${selectedAccount.debit?.toLocaleString() ?? '0.00'}</p>
              <p><strong>Credit:</strong> ${selectedAccount.credit?.toLocaleString() ?? '0.00'}</p>
              <p><strong>Status:</strong> {selectedAccount.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Order:</strong> {selectedAccount.order || 'N/A'}</p>
              <p><strong>Statement:</strong> {selectedAccount.statement || 'N/A'}</p>
              <p><strong>Comment:</strong> {selectedAccount.comment || 'N/A'}</p>
              <p><strong>Created:</strong> {new Date(selectedAccount.createdAt).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(selectedAccount.updatedAt).toLocaleString()}</p>
            </div>
          )}

          {/* Tab 1: Event Log History */}
          {detailsTab === 1 && (
            <div className="event-logs-container">
              {logsLoading ? (
                <p>Loading event logs...</p>
              ) : accountEventLogs.length === 0 ? (
                <p>No event logs found for this account.</p>
              ) : (
                <div className="event-logs-list">
                  {accountEventLogs.map((log) => (
                    <div key={log._id} className="event-log-card">
                      <div className="log-header">
                        <h4 className="log-action">{log.action}</h4>
                        <div className="log-meta">
                          <span className="log-user">👤 User: {log.userId || 'System'}</span>
                          <span className="log-timestamp">
                            🕐 {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {renderBeforeAfterComparison(log)}
                    </div>
                  ))}
                </div>
              )}
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