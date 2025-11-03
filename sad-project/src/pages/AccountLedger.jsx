import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableHead, TableBody, TableRow, TableCell,
  MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Box
} from '@mui/material';
import './accountledger.css';
import logo from "../assets/sweetledger.jpeg";
import { useNavigate, useParams, Link } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';



const AccountLedger = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);

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

  // example component body:
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

              {currentUser?.role !== 'Admin' && (
                <button className="nav-button" onClick={() => navigate("/journalentries")}>
                  📖 Journalize
                </button>
              )}
            </nav>

            {/* ===== Ledger Table ===== */}
      <div style={{ padding: '2rem' }}>
        {ledgerData ? (
          <>
            <h2>{ledgerData.account?.accountName !== "Unknown Account"
                ? ledgerData.account?.accountName
                : ledgerData.entries.find(e => e.accountName)?.accountName || 'Ledger'}</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reference No.</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerData.entries.map((entry, index) => (
                <TableRow key={entry._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>
                    <Link to={`/journalentries/${entry.journalId}`}>{index + 1}</Link>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">
                    {entry.debit !== 0 ? `$${entry.debit.toLocaleString()}` : ''}
                  </TableCell>
                  <TableCell align="right">
                    {entry.credit !== 0 ? `$${entry.credit.toLocaleString()}` : ''}
                  </TableCell>
                  <TableCell align="right">${entry.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
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