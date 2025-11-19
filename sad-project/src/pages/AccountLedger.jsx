import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableHead, TableBody, TableRow, TableCell,
  MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Box
} from '@mui/material';
import './AccountLedger.css';
import logo from "../assets/sweetledger.jpeg";
import { useNavigate, useParams, Link } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';



const AccountLedger = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]); 

  // Fetch current user
  useEffect(() => {
        const fetchCurrentUser = async () => {
          try {
            const response = await fetch("http://localhost:3000/api/curUser");
            const data = await response.json();
            setCurrentUser(data.currentUser || []);
              
          } catch (err) {
            console.warn("Could not fetch /api/curUser:", err);
          }
        };
        fetchCurrentUser();
      }, []);
      

  // Fetch ledger data for this account
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        console.log("Fetching ledger for account:", accountId);
        const res = await fetch(`http://localhost:3000/api/ledger/${accountId}`);
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Ledger data:", data);
        setLedgerData(data);
      } catch (err) {
        console.error("Failed to fetch ledger:", err);
      }
    };
    if (accountId) fetchLedger();
  }, [accountId]);

  // Handlers 
  // Filter + search logic
  useEffect(() => {
    if (!ledgerData?.entries) return;

    let entries = ledgerData.entries;

    // Sort by postedBy date (oldest first)
    entries.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));

    // Filter by date range
    if (startDate) {
      entries = entries.filter(e => new Date(e.date) >= new Date(startDate));
    }
    if (endDate) {
      entries = entries.filter(e => new Date(e.date) <= new Date(endDate));
    }

    // Search by account name or amount
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      entries = entries.filter(e => 
        e.accountName?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.debit.toString().includes(term) ||
        e.credit.toString().includes(term) ||
        e.balance.toString().includes(term)
      );
    }

    setFilteredEntries(entries);
  }, [ledgerData, startDate, endDate, searchTerm]);


  const handleLogout = () => {
    navigate("/");
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
              <h1 className="admin-title">Ledger</h1>
            </div>
            <HelpButton />

            {/* ===== User Section ===== */}
            <div className="user-section">
            <span className="welcome-text">Welcome,</span>
            <div>
              <div className="username">
                {currentUser?.curUsername}
              </div>
              <span className="admin-badge">{currentUser?.role}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          </header>
    
           <nav className="dashboard-nav" style={{ backgroundColor: '#ebebeb75', borderBottom: '1px solid #ccc' }}>
              <div className="button-container">
                <Calendar title="Calendar" />
                <span className="tooltiptext">Click here to open the calendar</span>
              </div>

              <button
                className="nav-button"
                onClick={() => {
                  if (currentUser?.role === "Manager") navigate("/manager");
                  else if (currentUser?.role === "Accountant") navigate("/regularaccountuser");
                  else navigate("/administrator");
                }}>
                🏠 Dashboard
              </button>

              <button
                className="nav-button"
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
                📖 Journalize
              </button>
              <button className="nav-button" onClick={() => navigate("/reports")}>
			          📊 Financial Reports
		          </button>
            
            </nav>

      {/* ===== Ledger Table ===== */}
      <div style={{ padding: '2rem'}}>
        {ledgerData ? (
          <>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>
               {(() => {
                  const accountNumber = ledgerData?.account?.accountId || accountId || 'Unknown Account';
                  let accountName = '';

                  if (ledgerData?.account?.accountName && ledgerData.account.accountName !== "Unknown Account") {
                    accountName = ledgerData.account.accountName;
                  } else {
                    // Pull from first entry if account name missing
                    const entryWithName = ledgerData?.entries?.find(e => e.accountName);
                    accountName = entryWithName?.accountName || 'Ledger';
                  }

                  return <span style={{color: 'black'}}>{`${accountNumber} - ${accountName}`}</span>;
                })()}
              </h2>

    {/* ===== Search & Date Filters ===== */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {/* Search Bar (left) */}
            <TextField
              label="Search"
              placeholder="Name, description, or amount"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 800 }}
            />

            {/* Date Pickers */}
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
            />

            {/* Clear Button */}
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
            >
              Clear
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Post Reference</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry, index) => (
                    <TableRow key={entry._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell align='left'>
                         <span
                            style={{ cursor: 'pointer', color: '#1976d2', paddingLeft: '50px'}}
                            onClick={() => navigate(`/journalentries/${entry.journalId}`)}

                          > {"JE-"+ (index + 1)} </span>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell align="right">
                        {entry.debit !== 0 ? `$${entry.debit.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                          }) ?? '0.00'}` : ''}
                      </TableCell>
                      <TableCell align="right">
                        {entry.credit !== 0 ? `$${entry.credit.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                          }) ?? '0.00'}` : ''}
                      </TableCell>
                      <TableCell align="right">${entry.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                          }) ?? '0.00'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No entries match your filter or search.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
          </>
        ) : (
          <p>Loading ledger...</p>
        )}
      </div>
    </div>
    
  );
};

export default AccountLedger;