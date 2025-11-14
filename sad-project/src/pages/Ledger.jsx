import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Button, TextField, Table, TableHead, TableBody, TableRow, TableCell,
  FormControl, InputLabel, Select, MenuItem, Paper
} from '@mui/material';
import './Ledger.css';
import logo from "../assets/sweetledger.jpeg";
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';

const Ledger = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get account details passed from Chart of Accounts (for fallback display)
  const _passedAccountNumber = location.state?.accountNumber;
  const _passedAccountName = location.state?.accountName;

  // ===== State Variables =====
  const [account, setAccount] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ===== Fetch Current User =====
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("${import.meta.env.VITE_API_URL}/api/curUser");
        const data = await response.json();
        setCurrentUser(data.currentUser || []);
      } catch (err) {
        console.warn("Could not fetch /api/curUser:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // ===== Fetch Ledger Entries from API =====
  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true);
      try {
        // Build query params for date filtering
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const queryString = params.toString();
        const url = `${import.meta.env.VITE_API_URL}/api/ledger/${accountId}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch ledger data');
        
        const data = await response.json();

        setAccount(data.account);
        setLedgerEntries(data.entries);
        setFilteredEntries(data.entries);
        setLoading(false);
      } catch (err) {
        console.error('Error loading ledger:', err);
        setError('Failed to load ledger entries from database');
        setLoading(false);
      }
    };

    fetchLedgerData();
  }, [accountId, startDate, endDate]);

  // ===== Handle Search and Filter =====
  const handleSearch = () => {
    let results = [...ledgerEntries];

    // Filter by date range
    if (startDate) {
      results = results.filter(entry => new Date(entry.date) >= new Date(startDate));
    }
    if (endDate) {
      results = results.filter(entry => new Date(entry.date) <= new Date(endDate));
    }

    // Search by query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      switch (filterType) {
        case 'description':
          results = results.filter(entry => 
            entry.description?.toLowerCase().includes(query)
          );
          break;
        case 'amount':
          results = results.filter(entry => {
            const debitMatch = entry.debit.toString().includes(query.replace(/[,$]/g, ''));
            const creditMatch = entry.credit.toString().includes(query.replace(/[,$]/g, ''));
            return debitMatch || creditMatch;
          });
          break;
        case 'postReference':
          results = results.filter(entry => 
            entry.postReference?.toLowerCase().includes(query)
          );
          break;
        case 'all':
        default:
          results = results.filter(entry => {
            const descMatch = entry.description?.toLowerCase().includes(query);
            const debitMatch = entry.debit.toString().includes(query.replace(/[,$]/g, ''));
            const creditMatch = entry.credit.toString().includes(query.replace(/[,$]/g, ''));
            const prMatch = entry.postReference?.toLowerCase().includes(query);
            return descMatch || debitMatch || creditMatch || prMatch;
          });
      }
    }

    setFilteredEntries(results);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilterType('all');
    setFilteredEntries(ledgerEntries);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ===== Navigate to Journal Entry with Highlighting =====
  const handlePostReferenceClick = (journalId) => {
    if (!journalId) {
      console.warn('No journal ID provided');
      return;
    }
    // Navigate to journal with the entry ID to highlight
    navigate(`/journal/${journalId}`);
  };

  const handleBackToChart = () => {
    navigate('/chartofaccounts');
  };

  if (loading) {
    return (
      <div className="ledger-container">
        <header className="ledger-header">
          <h1 className="ledger-title">Account Ledger</h1>
        </header>
        <div className="ledger-section">
          <p>Loading ledger entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-container">
      {/* ===== Header ===== */}
      <header className="ledger-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={logo} 
            alt="Sweet Ledger Logo" 
            className="header-logo"
          />
          <div>
            <h1 className="ledger-title">Account Ledger</h1>
            {account && (
              <p className="account-subtitle">
                Account #{account.accountNumber} - {account.accountName}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="header-actions">
            <Button 
              className="back-btn" 
              onClick={handleBackToChart}
              variant="outlined"
            >
              Back to Chart of Accounts
            </Button>
            <HelpButton />
          </div>
        </div>
      </header>

      {/* ===== Navigation Bar ===== */}
      <nav className="dashboard-nav">
        <div className="button-container">
          <Calendar title="Calendar" />
          <span className="tooltiptext">Click here to open the calendar</span>
        </div>
        <button className="nav-button"
          onClick={() => {
            if (currentUser?.role === "Manager") navigate("/manager");
            else if (currentUser?.role === "Accountant") navigate("/regularaccountuser");
            else navigate("/administrator");
          }}>
          🏠 Dashboard
        </button>
        <button className="nav-button"
          onClick={() => {
            if (currentUser?.role === "Manager") navigate("/AccountView");
            else if (currentUser?.role === "Accountant") navigate("/AccountView");
            else navigate("/accountmanagement");
          }}>
          👤 Account Management
        </button>
        <button className="nav-button" onClick={() => navigate("/chartofaccounts")}>
          📋 Chart of Accounts
        </button>
        <button className="nav-button" onClick={() => navigate("/eventlog")}>
          📝 Event Log
        </button>
        <button className="nav-button" onClick={() => navigate("/journalentries")}>
          📖 Journal Entries
        </button>
        <button className="nav-button" onClick={() => navigate("/reports")}>
          📊 Financial Reports
        </button>
      </nav>

      {/* ===== Error Message ===== */}
      {error && (
        <div className="ledger-section">
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* ===== Account Summary ===== */}
      {account && (
        <Paper className="ledger-section account-summary">
          <h2>Account Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Account Number:</strong> {account.accountId}
            </div>
            <div className="summary-item">
              <strong>Account Name:</strong> {account.accountName}
            </div>
            <div className="summary-item">
              <strong>Normal Side:</strong> {account.normalSide}
            </div>
            <div className="summary-item">
              <strong>Category:</strong> {account.accountCategory || 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Initial Balance:</strong> ${account.initialBalance?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) ?? '0.00'}
            </div>
            <div className="summary-item">
              <strong>Current Balance:</strong> ${account.balance?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) ?? '0.00'}
            </div>
          </div>
        </Paper>
      )}

      {/* ===== Search and Filter Section ===== */}
      <div className="ledger-section">
        <h2>Filter and Search Ledger Entries</h2>
        
        {/* Date Range Filter */}
        <div className="filter-row">
          <div className="date-filters">
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ minWidth: '180px' }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ minWidth: '180px' }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="filter-row" style={{ marginTop: '1rem' }}>
          <FormControl size="small" style={{ minWidth: '180px' }}>
            <InputLabel>Search By</InputLabel>
            <Select
              value={filterType}
              label="Search By"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="description">Description</MenuItem>
              <MenuItem value="amount">Amount (Debit/Credit)</MenuItem>
              <MenuItem value="postReference">Post Reference</MenuItem>
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
            className="search-btn" 
            onClick={handleSearch}
          >
            Search
          </Button>

          <Button 
            variant="outlined" 
            className="clear-btn" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>

        {/* Results Count */}
        {filteredEntries.length !== ledgerEntries.length && (
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.95rem' }}>
            Showing {filteredEntries.length} of {ledgerEntries.length} entries
          </p>
        )}
      </div>

      {/* ===== Ledger Entries Table ===== */}
      <div className="ledger-section">
        <h2>Ledger Entries ({filteredEntries.length})</h2>
        
        {filteredEntries.length === 0 ? (
          <p>No ledger entries found for this account.</p>
        ) : (
          <Table className="ledger-table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Post Reference (PR)</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="right"><strong>Debit</strong></TableCell>
                <TableCell align="right"><strong>Credit</strong></TableCell>
                <TableCell align="right"><strong>Balance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Initial Balance Row */}
              {account && (
                <TableRow className="initial-balance-row">
                  <TableCell colSpan={3}><em>Initial Balance</em></TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell align="right">
                    <strong>${account.initialBalance?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) ?? '0.00'}</strong>
                  </TableCell>
                </TableRow>
              )}

              {/* Ledger Entries */}
              {filteredEntries.map((entry, index) => (
                <TableRow key={`${entry._id}-${index}`} className="ledger-entry-row">
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {entry.journalId ? (
                      <span 
                        className="clickable-post-reference"
                        onClick={() => handlePostReferenceClick(entry.journalId)}
                        title="Click to view journal entry"
                        style={{
                          color: '#f7941d',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#e6830c'}
                        onMouseLeave={(e) => e.target.style.color = '#f7941d'}
                      >
                        {entry.postReference}
                      </span>
                    ) : (
                      <span>{entry.postReference}</span>
                    )}
                  </TableCell>
                  <TableCell>{entry.description || '-'}</TableCell>
                  <TableCell align="right">
                    {entry.debit > 0 ? `$${entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {entry.credit > 0 ? `$${entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <strong className={entry.balance < 0 ? 'negative-balance' : ''}>
                      ${Math.abs(entry.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {entry.balance < 0 && ' CR'}
                    </strong>
                  </TableCell>
                </TableRow>
              ))}

              {/* Final Balance Row */}
              {filteredEntries.length > 0 && (
                <TableRow className="final-balance-row">
                  <TableCell colSpan={3}><strong>Ending Balance</strong></TableCell>
                  <TableCell align="right">
                    <strong>
                      ${filteredEntries.reduce((sum, e) => sum + e.debit, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      ${filteredEntries.reduce((sum, e) => sum + e.credit, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong className={filteredEntries[filteredEntries.length - 1]?.balance < 0 ? 'negative-balance' : ''}>
                      ${Math.abs(filteredEntries[filteredEntries.length - 1]?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {filteredEntries[filteredEntries.length - 1]?.balance < 0 && ' CR'}
                    </strong>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Ledger;