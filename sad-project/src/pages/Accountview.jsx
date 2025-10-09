import React, { useState, useEffect } from "react";
import "./Accountview.css";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);

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
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/accounts");
        const data = await response.json();
        setAccounts(data || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="admin-container">
      {/* ===== Header Section ===== */}
      <div className="admin-header">
        <h5 className="admin-title">
          Administrator Account Management
        </h5>
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
            <img src="/api/placeholder/40/40" alt="Profile" />
          </div>
        </div>
      </div>

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
          <h6 style={{ marginBottom: '16px' }}>
            Existing Accounts
          </h6>
          <table className="account-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>Category</th>
                <th>Balance</th>
                <th>Statement</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={i}>
                  <td>{a.accountName}</td>
                  <td>{a.accountNumber}</td>
                  <td>{a.category}</td>
                  <td>{parseFloat(a.balance).toFixed(2)}</td>
                  <td>{a.statement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}