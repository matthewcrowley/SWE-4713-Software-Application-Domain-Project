import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Accountview.css";
import logo from "../assets/sweetledger.jpeg";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";

export default function Accountview() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [sortedAccounts, setSortedAccounts] = useState([]);
  

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const data = await response.json();
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessage("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch accounts
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

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="admin-container">
      <HelpButton />
      {/* ===== Header Section ===== */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="SweetLedger Logo" style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
          <h5 className="admin-title">
            Account View
          </h5>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="back-btn"
            onClick={handleBack}
          >
            Back to Dashboard
          </button>
          <button
            className="btn"
            onClick={() => setMessage("No Current Expired Passwords")}
          >
            Generate Expired Passwords Report
          </button>
          <div className="avatar">
          </div>
        </div>
      </div>
      {/* Navigation */}
        <nav className="dashboard-nav" style={{ backgroundColor: '#edededff' }}>
          <div className="button-container">
            <Calendar title="Calander" />
            <span className="tooltiptext">Click here to open the calendar</span>
          </div>
          <button className="nav-button" onClick={() =>navigate('/AccountView')}>👤 Accounts</button>
          <button className="nav-button">🏠 Dashboard</button>
          <button className="nav-button">📋 Chart</button>
          <button className="nav-button">📝 Event Log</button>
          <button className="nav-button">📖 Journal</button>
        </nav>

    

      {/* ===== Main Content ===== */}
      <div className="admin-content">
        {/* ========== USER MANAGEMENT ========== */}
        <div className="admin-section">
          <h6 style={{ marginBottom: '16px' }}>
            User Management
          </h6>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td
                      className={
                        u.active ? "status-active" : "status-inactive"
                      }
                    >
                      {u.active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ========== ACCOUNT MANAGEMENT ========== */}
        <div className="admin-section">
        <h2>Accounts</h2>
        <p>Manage your accounts here.</p>

        {loading ? (
          <p>Loading accounts...</p>
        ) : sortedAccounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <table className="account-table" border="1" cellPadding="8" style={{color: 'black'}}>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Account Number</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Balance</th>
                <th>Statement</th>
              </tr>
            </thead>
            <tbody>
              {sortedAccounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.account_name}</td>
                  <td>{account.account_number}</td>
                  <td>{account.type}</td>
                  <td>{account.subcategory}</td>
                  <td style={{ textAlign: 'right' }}>${account.balance.toFixed(2)}</td>
                  <td>{account.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}