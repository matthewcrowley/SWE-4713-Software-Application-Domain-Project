import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import './Eventlog.css';
import { useNavigate } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';
import logo from "../assets/sweetledger.jpeg";

const Eventlog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortedLogs, setSortedLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("${import.meta.env.VITE_API_URL}/api/curUser");
        const data = await response.json();
        setCurrentUser(data.currentUser || null);
      } catch (err) {
        console.warn("Could not fetch /api/curUser:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch event logs
  useEffect(() => {
  fetch('${import.meta.env.VITE_API_URL}/api/eventlog')
    .then((res) => res.json())
    .then((data) => {
      console.log("Eventlog API response:", data); // <- Check this
      setLogs(data);
      setLoading(false);
    })
    .catch((e) => {
      console.error('Failed to fetch event logs', e);
      setLoading(false);
    });
}, []);


  // Sort logs by timestamp
  useEffect(() => {
    const sorted = [...logs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    setSortedLogs(sorted);
  }, [logs, sortOrder]);

  <tbody>
  {sortedLogs.map((log) => (
    <tr key={log._id}>
      <td>{log._id}</td>
      <td>{log.userId}</td>
      <td>{log.action}</td>
      <td>{new Date(log.timestamp).toLocaleString()}</td>
      <td>
        {log.before ? (
          <div>
            <div><strong>First Name:</strong> {log.before.firstName}</div>
            <div><strong>Last Name:</strong> {log.before.lastName}</div>
            <div><strong>DOB:</strong> {log.before.dob}</div>
            <div><strong>Address:</strong> {log.before.address}</div>
            <div><strong>Email:</strong> {log.before.email}</div>
            <div><strong>Username:</strong> {log.before.username}</div>
          </div>
        ) : (
          <em>New Account</em>
        )}
      </td>
      <td>
        {log.after && (
          <div>
            <div><strong>First Name:</strong> {log.after.firstName}</div>
            <div><strong>Last Name:</strong> {log.after.lastName}</div>
            <div><strong>DOB:</strong> {log.after.dob}</div>
            <div><strong>Address:</strong> {log.after.address}</div>
            <div><strong>Email:</strong> {log.after.email}</div>
            <div><strong>Username:</strong> {log.after.username}</div>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>

  return (
    <div className="admin-container">
      <HelpButton />
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="Sweet Ledger Logo" className="header-logo" />
          <h1 className="admin-title">Event Log</h1>
        </div>

        <div className="header-actions">
          <Button
            className="generate-report-btn"
            onClick={handleGenerateReport}
            variant="contained"
          >
            Generate Expired Passwords Report
          </Button>
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
					}}
				  >
					🏠 Dashboard
				  </button>
				  <button
					className="nav-button"
					onClick={() => {
					  if (currentUser?.role === "Manager" || currentUser?.role === "Accountant") navigate("/AccountView");
					  else navigate("/accountmanagement");
					}}
				  >
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
          {currentUser?.role !== 'Admin' && <button className="nav-button" onClick={() => navigate("/reports")}>
            📊 Financial Reports
          </button>}
				</nav>

      <div className="admin-section">
        <h2>Event Log</h2>
        <p>View all account changes, including before and after states.</p>

        {loading ? (
  <p>Loading event logs...</p>
) : sortedLogs.length === 0 ? (
  <p>No event logs found.</p>
) : (
  <table className="eventlog-table" border="1" cellPadding="8">
    <thead>
      <tr>
        <th>ID</th>
        <th>User ID</th>
        <th>Action</th>
        <th
          style={{ cursor: 'pointer' }}
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          Timestamp {sortOrder === 'asc' ? '▲' : '▼'}
        </th>
        <th>Before</th>
        <th>After</th>
      </tr>
    </thead>
    <tbody>
      {sortedLogs.map((log) => (
        <tr key={log._id}>
          <td>{log._id}</td>
          <td>{log.userId}</td>
          <td>{log.action}</td>
          <td>{new Date(log.timestamp).toLocaleString()}</td>

          {/* Before snapshot */}
          <td>
            {log.before ? (
              <div>
                <div><strong>First Name:</strong> {log.before.firstName}</div>
                <div><strong>Last Name:</strong> {log.before.lastName}</div>
                <div><strong>DOB:</strong> {log.before.dob}</div>
                <div><strong>Address:</strong> {log.before.address}</div>
                <div><strong>Email:</strong> {log.before.email}</div>
                <div><strong>Username:</strong> {log.before.username}</div>
              </div>
            ) : (
              <em>New Account</em>
            )}
          </td>

          {/* After snapshot */}
          <td>
  { (log.after || log.afterImage) ? (
    <div>
      <div><strong>First Name:</strong> {(log.after || log.afterImage)?.firstName}</div>
      <div><strong>Last Name:</strong> {(log.after || log.afterImage)?.lastName}</div>
      <div><strong>DOB:</strong> {(log.after || log.afterImage)?.dob}</div>
      <div><strong>Address:</strong> {(log.after || log.afterImage)?.address}</div>
      <div><strong>Email:</strong> {(log.after || log.afterImage)?.email}</div>
      <div><strong>Username:</strong> {(log.after || log.afterImage)?.username}</div>
    </div>
  ) : (
    <em>No After Snapshot</em>
  )}
</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

      </div>
    </div>
  );
};

export default Eventlog;