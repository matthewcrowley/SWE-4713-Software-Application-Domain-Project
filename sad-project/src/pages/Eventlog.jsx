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

  // Fetch the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/curUser");
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
  fetch('http://localhost:3000/api/eventlog')
    .then((res) => res.json())
    .then((data) => {
      console.log("Eventlog API response:", data);
      setLogs(data);
      setLoading(false);
    })
    .catch((e) => {
      console.error('Failed to fetch event logs', e);
      setLoading(false);
    });
}, []);

const handleLogout = () => {
    navigate("/");
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <img src={logo} 
          alt="Sweet Ledger Logo" 
          style={{ width: '100px', height: 'auto' }}
          className="header-logo" />
          <h1 className="admin-title">Event Log</h1>

          {/* ===== User Section ===== */}
          <div className="user-section" style={{ marginLeft: 'auto' }}>
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
        <div className="header-actions" style={{justifyContent:'space-between'}}>
          <h2>Event Log</h2>
        </div>
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
          style={{ cursor: 'pointer'}}
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
            log.targetType === 'journalEntry' ? (
              <div>
                <div><strong>Date:</strong> {log.before.date}</div>
                <div><strong>Description:</strong> {log.before.description}</div>
                <div><strong>Status:</strong> {log.before.status}</div>
                <div><strong>Created By:</strong> {log.before.createdBy}</div>
                <div>
                  <strong>Entries:</strong>
                  <ul>
                    {log.before.entries?.map((e, idx) => (
                      <li key={idx}>
                        <strong>Account Number:</strong> {e.accountId}
                        <div style={{ marginLeft: '1rem' }}>
                          Debit: $
                          {e.debit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                          Credit: $
                          {e.credit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div><strong>Created At: </strong>{log.before.createdAt}</div>
              </div>
            ) : (
              // fallback for other types (like user accounts)
              <div>
                <div><strong>First Name:</strong> {log.before.firstName}</div>
                <div><strong>Last Name:</strong> {log.before.lastName}</div>
                <div><strong>Email:</strong> {log.before.email}</div>
                <div><strong>Username:</strong> {log.before.username}</div>
              </div>
            )
          ) : (
            <em></em>
          )}
        </td>

        <td>
          {(log.after || log.afterImage) ? (
            log.targetType === 'journalEntry' ? (
              <div>
                <div><strong>Date:</strong> {(log.after || log.afterImage).date}</div>
                <div><strong>Description:</strong> {(log.after || log.afterImage).description}</div>
                <div><strong>Status:</strong> {(log.after || log.afterImage).status}</div>
                <div><strong>Created By:</strong> {(log.after || log.afterImage).createdBy}</div>
                <div>
                  <strong>Entries:</strong>
                  <ul>
                    {(log.after || log.afterImage).entries?.map((e, idx) => (
                      <li key={idx}>
                        <strong>Account Number:</strong> {e.accountId}
                        <div style={{ marginLeft: '1rem' }}>
                          Debit: $
                          {e.debit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                          Credit: $
                          {e.credit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div><strong>Created At: </strong>{log.after.createdAt}</div>
                {log.after.comment != null && <div><strong>Comment: </strong>{log.after.comment || "Rejected"}</div>}
                {log.after.reviewedBy != null && <div><strong>Reviewed By: </strong>{log.after.reviewedBy}</div>}
                {log.after.reviewedAt != null && <div><strong>Reviewed At: </strong>{log.after.reviewedAt}</div>}
              </div>
            ) : (
              <div>
                <div><strong>First Name:</strong> {(log.after || log.afterImage)?.firstName}</div>
                <div><strong>Last Name:</strong> {(log.after || log.afterImage)?.lastName}</div>
                <div><strong>Email:</strong> {(log.after || log.afterImage)?.email}</div>
                <div><strong>Username:</strong> {(log.after || log.afterImage)?.username}</div>
              </div>
            )
          ) : (
            <em>Deleted Record</em>
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