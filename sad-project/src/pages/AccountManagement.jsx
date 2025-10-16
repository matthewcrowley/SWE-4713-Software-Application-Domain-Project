import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  TextField,
  MenuItem,
  Select,
  Grid,
} from "@mui/material";
import defaultProfile from "../assets/defaultprofile.png";
import "./accountmanagement.css";
import { useNavigate } from "react-router-dom";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";
import logo from "../assets/sweetledger.jpeg";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "User",
  });

  const [accounts, setAccounts] = useState([]);
  const [accountForm, setAccountForm] = useState({
    accountName: "",
    accountNumber: "",
    description: "",
    normalSide: "Debit",
    category: "",
    subcategory: "",
    initialBalance: "",
    debit: "",
    credit: "",
    balance: "",
    dateAdded: "",
    userId: "",
    order: "",
    statement: "BS",
    comment: "",
  });

  const navigate = useNavigate();

  const formatMoney = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

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

  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveUserUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${editingUser}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser ? { ...u, ...editForm } : u))
        );
        setMessage(`User ID ${editingUser} updated successfully`);
        setEditingUser(null);
      } else {
        setMessage("Failed to update user: " + data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage("Server error while updating user.");
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${user.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !user.active }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
        );
        setMessage(
          `User ${user.username} is now ${
            !user.active ? "active" : "inactive"
          }`
        );
      } else {
        setMessage("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Server error while updating status.");
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    const moneyFields = ["initialBalance", "debit", "credit", "balance"];
    setAccountForm({
      ...accountForm,
      [name]: moneyFields.includes(name) ? formatMoney(value) : value,
    });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const newAccount = {
      ...accountForm,
      initialBalance: formatMoney(accountForm.initialBalance),
      debit: formatMoney(accountForm.debit),
      credit: formatMoney(accountForm.credit),
      balance: formatMoney(accountForm.balance),
      dateAdded: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3000/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      const data = await response.json();

      if (data.success) {
        setAccounts([...accounts, newAccount]);
        setMessage("Account added successfully!");
        setAccountForm({
          accountName: "",
          accountNumber: "",
          description: "",
          normalSide: "Debit",
          category: "",
          subcategory: "",
          initialBalance: "",
          debit: "",
          credit: "",
          balance: "",
          dateAdded: "",
          userId: "",
          order: "",
          statement: "BS",
          comment: "",
        });
      } else {
        setMessage("Failed to add account: " + data.message);
      }
    } catch (error) {
      console.error("Error adding account:", error);
      setMessage("Server error while adding account.");
    }
  };

  return (
    <Box className="admin-container">
      <HelpButton />
      {/* ===== Header Section ===== */}
      <Box className="admin-header">
        <img src={logo} alt="SweetLedger Logo" className="header-logo" />
        <Calendar />
        <Typography variant="h5" className="admin-title">
          Administrator Account Management
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            className="back-btn"
            onClick={() => navigate("/administrator")}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            className="btn"
            onClick={() => setMessage("No Current Expired Passwords")}
          >
            Generate Expired Passwords Report
          </Button>
          <Avatar src={defaultProfile} alt="Profile" />
        </Box>
      </Box>

      {/* ===== Main Content ===== */}
      <Box className="admin-content">
        {/* ========== USER MANAGEMENT ========== */}
        <Paper elevation={1} className="admin-section">
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          {loading ? (
            <Typography>Loading users...</Typography>
          ) : users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {editingUser === u.id ? (
                        <TextField
                          size="small"
                          name="username"
                          value={editForm.username}
                          onChange={handleEditChange}
                        />
                      ) : (
                        u.username
                      )}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <TextField
                          size="small"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <Select
                          size="small"
                          name="role"
                          value={editForm.role}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="User">User</MenuItem>
                          <MenuItem value="Manager">Manager</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td
                      className={
                        u.active ? "status-active" : "status-inactive"
                      }
                    >
                      {u.active ? "Active" : "Inactive"}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <>
                          <Button
                            className="btn"
                            onClick={saveUserUpdate}
                            size="small"
                          >
                            Save
                          </Button>
                          <Button
                            className="btn cancel"
                            onClick={() => setEditingUser(null)}
                            size="small"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="btn"
                            size="small"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            className={`btn ${
                              u.active ? "deactivate" : "activate"
                            }`}
                            size="small"
                            onClick={() => toggleUserStatus(u)}
                          >
                            {u.active ? "Deactivate" : "Activate"}
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>

        {/* ========== ACCOUNT MANAGEMENT ========== */}
        <Paper elevation={1} className="admin-section">
          <Typography variant="h6" gutterBottom>
            Account Management
          </Typography>
          <form className="account-form" onSubmit={handleAddAccount}>
            <Grid container spacing={2}>
              {[
                "accountName",
                "accountNumber",
                "description",
                "category",
                "subcategory",
                "initialBalance",
                "debit",
                "credit",
                "balance",
                "userId",
                "order",
                "comment",
              ].map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <TextField
                    fullWidth
                    size="small"
                    name={field}
                    label={field.replace(/([A-Z])/g, " $1")}
                    value={accountForm[field]}
                    onChange={handleAccountChange}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6} md={4}>
                <Select
                  fullWidth
                  size="small"
                  name="normalSide"
                  value={accountForm.normalSide}
                  onChange={handleAccountChange}
                >
                  <MenuItem value="Debit">Debit</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Select
                  fullWidth
                  size="small"
                  name="statement"
                  value={accountForm.statement}
                  onChange={handleAccountChange}
                >
                  <MenuItem value="IS">Income Statement</MenuItem>
                  <MenuItem value="BS">Balance Sheet</MenuItem>
                  <MenuItem value="RE">Retained Earnings</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button className="btn" type="submit">
                Add Account
              </Button>
            </Box>
          </form>

          <Typography variant="h6" mt={3}>
            Existing Accounts
          </Typography>
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
        </Paper>

        {message && <p className="status-message">{message}</p>}
      </Box>
    </Box>
  );
}
