import React, {useState, useEffect} from 'react';
import {Button} from '@mui/material';
import './eventlog.css';
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
  const handleBackToDashboard = () => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'administrator') navigate('/administrator');
    else if (userRole === 'manager') navigate('/manager');
    else if (userRole === 'regularuser') navigate('/regularaccountuser');
    else navigate('/administrator');
  };
  const handleGenerateReport = () => {
    console.log('Generating report...');
    
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/eventlog')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to fetch event logs', e);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const sorted = [...logs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    setSortedLogs(sorted);
  }, [logs, sortOrder]);

  return (
    <div className="admin-container">
      <HelpButton />
      <header className="admin-header">
        <img src={logo} alt="SweetLedger Logo" className="header-logo" />
        <Calendar />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="admin-title">Event Log</h1>
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
            Generate Expired Passwords Report
          </Button>
        </div>
      </header>

      <div className="admin-section">
        <h2>Event Log</h2>
        <p>Manage your events here.</p>

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
                  <td>
                    <pre>{JSON.stringify(log.before, null, 2)}</pre>
                  </td>
                  <td>
                    <pre>{JSON.stringify(log.after, null, 2)}</pre>
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