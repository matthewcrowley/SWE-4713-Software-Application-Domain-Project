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
  // eslint-disable-next-line no-unused-vars
  const [accounts, setAccounts] = useState([]);
  const [sortedAccounts, setSortedAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current users
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
          // eslint-disable-next-line no-undef
          setError('Failed to load accounts from database');
          setLoading(false);
        });
    }, []);

  const handleBack = () => {
    window.history.back();
  };
  
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="admin-container">
      <HelpButton />
      {/* ===== Header Section ===== */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="SweetLedger Logo" style={{ width: '100px', height: 'auto' }} />
          <h5 className="admin-title">
            Account View
          </h5>
        </div>

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

      {/* ===== Navigation Bar ===== */}
      <nav className="dashboard-nav" style={{ backgroundColor: '#ebebeb75', borderBottom: '1px solid #ccc' }}>
        <div className="button-container">
            <Calendar title="Calander" />
            <span className="tooltiptext">Click here to open the calendar</span>
          </div>
          <button
            className="nav-button"
            onClick={() => {
              if (currentUser.role === "Manager") navigate("/manager");
              else if (currentUser.role === "Accountant") navigate("/regularaccountuser");
            }}>
            🏠 Dashboard
          </button>
          <button className="nav-button" onClick={() => navigate("/AccountView")}>
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

    

      {/* ===== Main Content ===== */}
      <div className="admin-content">
        {/* ========== USER MANAGEMENT ========== */}
        <div className="admin-section">
          <h6 style={{ marginBottom: '16px', color: 'black' }}>
            User Management
          </h6>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="user-table" style={{ color: 'black' }}>
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
                    <td>{u.role ? u.role : "No Role"}</td>  
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

{/*  
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
                  <td style={{ textAlign: 'right' }}>${account.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                          })}</td>
                  <td>{account.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
*/}
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}