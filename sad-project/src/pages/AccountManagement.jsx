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
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import "./AccountManagement.css";
import { useNavigate } from "react-router-dom";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";
import logo from "../assets/sweetledger.jpeg";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemErrorsData, setSystemErrorsData] = useState([]);
  const [showSystemErrors, setShowSystemErrors] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "Accountant",
  });

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/curUser");
        const data = await response.json();
        setCurrentUser(data.currentUser || []);
      } catch (err) {
        console.warn("Could not fetch /api/curUser:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // New state for creating users
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "Accountant",
  });

  // New state for user reports
  const [showUserReport, setShowUserReport] = useState(false);
  const [userReportData, setUserReportData] = useState([]);

  // New state for suspension
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendUser, setSuspendUser] = useState(null);
  const [suspendForm, setSuspendForm] = useState({
    startDate: "",
    expiryDate: "",
    reason: "",
  });

  // New state for expired passwords report
const [allUsers, setAllUsers] = useState([]);

// State to store users with expired passwords
const [expiredPasswordsData, setExpiredPasswordsData] = useState([]);

// State to show/hide dialog
const [showExpiredPasswordReport, setShowExpiredPasswordReport] = useState(false);


  // New state for email dialog
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    userId: "",
    username: "",
    email: "",
    subject: "",
    message: "",
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
        const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/users");
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
        const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/accounts");
        const data = await response.json();
        setAccounts(data || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, []);

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    navigate("/");
  };

  const saveUserUpdate = async () => {
    try {
      const response = await fetch(
        `https://swe-4713-software-application-domain.onrender.com/api/users/${editingUser}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser ? { ...u, ...editForm } : u))
        );
        setMessage(`User updated successfully`);
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
        `https://swe-4713-software-application-domain.onrender.com/api/users/${user._id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !user.active, updatedBy: currentUser?.curUsername || "Admin" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, active: !u.active } : u))
        );
        setMessage(
          `User ${user.username} is now ${!user.active ? "Active" : "Inactive"}`
        );
      } else {
        setMessage("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Server error while updating status.");
    }
  };

  // Handle create user form changes
  const handleCreateUserChange = (e) => {
    setCreateUserForm({ ...createUserForm, [e.target.name]: e.target.value });
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!createUserForm.username || !createUserForm.email || !createUserForm.password) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createUserForm,
          created_by: currentUser?.curUsername || "Admin",
          active: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the user list
        const usersResponse = await fetch("https://swe-4713-software-application-domain.onrender.com/api/users");
        const usersData = await usersResponse.json();
        setUsers(usersData || []);
        
        setMessage(`User ${createUserForm.username} created successfully with role ${createUserForm.role}`);
        setCreateUserForm({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          password: "",
          role: "Accountant",
        });
        setShowCreateUser(false);
      } else {
        setMessage("Failed to create user: " + data.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage("Server error while creating user.");
    }
  };

  const generateSystemErrorsReport = async () => {
  try {
    const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/errors");
    const data = await response.json();

    if (data.success && Array.isArray(data.errors)) {
      setSystemErrorsData(data.errors); 
      setShowSystemErrors(true);        
    } else {
      setMessage("Failed to fetch system errors");
    }
  } catch (error) {
    console.error("Error fetching system errors:", error);
    setMessage("Server error while fetching system errors.");
  }
};

  // Generate User Report
  const generateUserReport = async () => {
    try {
      const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/users");
      const data = await response.json();

      if (Array.isArray(data)) {
        setUserReportData(data);
        setShowUserReport(true);
      } else {
        setMessage("Failed to generate user report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setMessage("Server error while generating report.");
    }
  };

  // Open suspend dialog
  const openSuspendDialog = (user) => {
    setSuspendUser(user);
    setSuspendForm({
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      reason: "",
    });
    setShowSuspendDialog(true);
  };

  // Handle suspend user
  const handleSuspendUser = async () => {
    if (!suspendForm.expiryDate) {
      setMessage("Please select an expiry date");
      return;
    }

    try {
      const response = await fetch(
        `https://swe-4713-software-application-domain.onrender.com/api/users/${suspendUser._id}/suspend`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", updatedBy: currentUser?.curUsername || "Admin" },
          body: JSON.stringify(suspendForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === suspendUser._id
              ? { ...u, suspended: true, suspendedUntil: suspendForm.expiryDate }
              : u
          )
        );
        setMessage(`User ${suspendUser.username} suspended until ${suspendForm.expiryDate}`);
        setShowSuspendDialog(false);
        setSuspendUser(null);
      } else {
        setMessage("Failed to suspend user: " + data.message);
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      setMessage("Server error while suspending user.");
    }
  };

  // Handle unsuspend user - NEW FUNCTION
  const handleUnsuspendUser = async (user) => {
    try {
      const response = await fetch(
        `https://swe-4713-software-application-domain.onrender.com/api/users/${user._id}/unsuspend`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", updatedBy: currentUser?.curUsername || "Admin" },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id
              ? { ...u, suspended: false, suspendedUntil: null }
              : u
          )
        );
        setMessage(`User ${user.username} has been unsuspended`);
      } else {
        setMessage("Failed to unsuspend user: " + data.message);
      }
    } catch (error) {
      console.error("Error unsuspending user:", error);
      setMessage("Server error while unsuspending user.");
    }
  };

  // Generate Expired Passwords Report
  const generateExpiredPasswordsReport = () => {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = new Date();

  const expiredUsers = allUsers.filter(user => {
    if (!user.passwordUpdatedAt) return false; // skip users without a passwordUpdatedAt
    return new Date(user.passwordUpdatedAt) < new Date(now.getTime() - THIRTY_DAYS_MS);
  });

  setExpiredPasswordsData(expiredUsers);
  setShowExpiredPasswordReport(true);
};

  // Open email dialog
  const openEmailDialog = (user) => {
    setEmailForm({
      userId: user._id,
      username: user.username,
      email: user.email,
      subject: "",
      message: "",
    });
    setShowEmailDialog(true);
  };

  // Send email
  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      setMessage("Please fill in subject and message");
      return;
    }

    try {
      const response = await fetch("https://swe-4713-software-application-domain.onrender.com/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Email sent successfully to ${emailForm.username}`);
        setShowEmailDialog(false);
        setEmailForm({
          userId: "",
          username: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setMessage("Failed to send email: " + data.message);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage("Server error while sending email.");
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
  }

  return (
    <Box className="admin-container">
      {/* ===== Header Section ===== */}
      <Box className="admin-header">
        <header className="admin-header" style={{borderBottom: '0px', justifyContent: 'space-between', width: '100%'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <img 
              alt="Sweet Ledger Logo"
              src={logo} 
              style={{ width: '100px', height: 'auto' }}
              className="header-logo"
            />
            <h1 className="admin-title">Administrator Account Management</h1>
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
        </header>
      </Box>

      <nav className="dashboard-nav" style={{ backgroundColor: '#ebebeb75', borderBottom: '1px solid #ccc' }}>
        <div className="button-container">
          <Calendar title="Calander" />
          <span className="tooltiptext">Click here to open the calendar</span>
        </div>
        <button className="nav-button" onClick={() => navigate("/administrator")}>
          🏠 Dashboard
        </button>
        <button className="nav-button" onClick={() => { navigate("/accountmanagement");}}>
          👤 Account Management
        </button>
        <button className="nav-button" onClick={() => navigate("/chartofaccounts")}>
          📋 Chart of Accounts
        </button>
        <button className="nav-button" onClick={() => navigate("/eventlog")}>
          📝 Event Log
        </button>
      </nav>

      {/* ===== Main Content ===== */}
      <Box className="admin-content">
        {/* ========== USER MANAGEMENT ========== */}
        <Paper elevation={1} className="admin-section">
          <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                User Management
              </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
            <Button 
            variant="contained"
            className="btn"
            onClick={generateSystemErrorsReport}>
            View All System Critical Errors
            </Button>
            <Button
              variant="contained"
              className="btn"
              onClick={generateUserReport}
            >
              View All Users Report
            </Button>
            <Button 
            variant="contained"
            className="btn"
            onClick={generateExpiredPasswordsReport}>
            View Expired Passwords
            </Button>
            <Button
              className="btn"
              onClick={() => setShowCreateUser(!showCreateUser)}
            >
              {showCreateUser ? "Cancel" : "Create New User"}
            </Button>
          </Box>
          </Box>

          {/* Create User Form */}
          <Collapse in={showCreateUser}>
            <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Create New User
              </Typography>
              <form onSubmit={handleCreateUser}>
                <Grid container spacing={2}>
                   <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="firstName"
                      label="First Name *"
                      value={createUserForm.firstName}
                      onChange={handleCreateUserChange}
                      required
                    />
                  </Grid>
                   <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="lastName"
                      label="Last Name *"
                      value={createUserForm.lastName}
                      onChange={handleCreateUserChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="username"
                      label="Username *"
                      value={createUserForm.username}
                      onChange={handleCreateUserChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="email"
                      label="Email *"
                      type="email"
                      value={createUserForm.email}
                      onChange={handleCreateUserChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      label="Password *"
                      type="password"
                      value={createUserForm.password}
                      onChange={handleCreateUserChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select
                      fullWidth
                      size="small"
                      name="role"
                      value={createUserForm.role}
                      onChange={handleCreateUserChange}
                    >
                      <MenuItem value="Accountant">Accountant</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12}>
                    <Button className="btn" type="submit">
                      Create User
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Collapse>

          {/* User List */}
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
                  <tr key={u._id}>
                    <td>
                      {editingUser === u._id ? (
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
                      {editingUser === u._id ? (
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
                      {editingUser === u._id ? (
                        <Select
                          size="small"
                          name="role"
                          value={editForm.role}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="Accountant">Accountant</MenuItem>
                          <MenuItem value="Manager">Manager</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td>
                      {u.suspended ? (
                        <Chip label="Suspended" color="warning" size="small" />
                      ) : (
                        <span className={u.active ? "status-active" : "status-inactive"}>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingUser === u._id ? (
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
                            className="btn edit-btn"
                            size="small"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            className={`btn ${u.active ? "deactivate" : "activate"}`}
                            size="small"
                            onClick={async () => {
                              try {
                                const newActiveStatus = !u.active;

                                const response = await fetch(
                                 `https://swe-4713-software-application-domain.onrender.com/api/users/${u._id}`,
                                    {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ active: newActiveStatus, updatedBy: currentUser?.curUsername || "Admin" }),
                                    }
                                  );

                                  const data = await response.json();

                                  if (data.success) {
                                    setUsers(prev =>
                                    prev.map(user =>
                                     user._id === u._id ? { ...user, active: newActiveStatus } : user
                                    )
                                    );
                                  } else {
                                  console.error("Failed to update user status:", data.message);
                                  }
                                } catch (err) {
                              console.error("Error updating user status:", err);
                            }
                            }}
                            >
                            {u.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            className={`btn ${u.suspended ? "unsuspend" : "suspend"}`}
                            size="small"
                            onClick={() => u.suspended ? handleUnsuspendUser(u) : openSuspendDialog(u)}
                          >
                            {u.suspended ? "Unsuspend" : "Suspend"}
                          </Button>
                          <Button
                            className="btn email"
                            size="small"
                            onClick={() => openEmailDialog(u)}
                          >
                            Email
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
                <th>Account Number</th>
                <th>Account Name</th>
                <th>Account Type</th>
                <th>Subcategory</th>
                <th>Balance</th>
                <th>Created By</th>
                <th>Date Created</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={i}>
                  <td>{a.account_number}</td>
                  <td>{a.account_name}</td>
                  <td>{a.type}</td>
                  <td>{a.subcategory}</td>
                  <td style={{ textAlign: 'right' }}>${a.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</td>
                  <td>{a.created_by}</td>
                  <td>{a.timestamp}</td>
                  <td>{a.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>

        {message && <p className="status-message">{message}</p>}
      </Box>

      <Dialog open={showSystemErrors} onClose={() => setShowSystemErrors(false)} maxWidth="md" fullWidth>
        <DialogTitle>System Critical Errors</DialogTitle>
        <DialogContent dividers>
          {systemErrorsData.length === 0 ? (
            <Typography>No system errors found.</Typography>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Timestamp</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Message</th>
                </tr>
             </thead>
              <tbody>
                {systemErrorsData.map((err) => (
                  <tr key={err.errorId}>
                    <td style={{ padding: "0.5rem" }}>{err.errorId}</td>
                    <td style={{ padding: "0.5rem" }}>{new Date(err.timestamp).toLocaleString()}</td>
                    <td style={{ padding: "0.5rem" }}>{err.message}</td>
                 </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSystemErrors(false)} className="btn">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== USER REPORT DIALOG ========== */}
      <Dialog open={showUserReport} onClose={() => setShowUserReport(false)} maxWidth="lg" fullWidth>
        <DialogTitle>All Users Report</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Suspended</strong></TableCell>
                  <TableCell><strong>Created Date</strong></TableCell>
                  <TableCell><strong>Last Login</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userReportData.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.active ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{user.suspended ? (
                      <Chip label="True" color="warning" size="small" />
                    ) : (
                      <Chip label="False" color="default" size="small" />
                    )}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserReport(false)} className="btn">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== Expired Password Dialog ========== */}
      <Dialog
        open={showExpiredPasswordReport}
        onClose={() => setShowExpiredPasswordReport(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Expired Passwords</DialogTitle>
        <DialogContent>
          {expiredPasswordsData.length === 0 ? (
            <div style={{ padding: "1rem", fontSize: "1rem" }}>
              <strong>There are no users with expired passwords!</strong>
              <br />
              Passwords expire every 30 days.
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                 </TableRow>
                </TableHead>
                <TableBody>
                  {expiredPasswordsData.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                     <TableCell style={{ color: "#c0392b", fontWeight: 600 }}>
                       Please contact them to reset their password!
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </TableContainer>
         )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExpiredPasswordReport(false)} className="btn">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== SUSPEND USER DIALOG ========== */}
      <Dialog open={showSuspendDialog} onClose={() => setShowSuspendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend User: {suspendUser?.username}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={suspendForm.startDate}
              onChange={(e) => setSuspendForm({ ...suspendForm, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Expiry Date *"
              type="date"
              name="expiryDate"
              value={suspendForm.expiryDate}
              onChange={(e) => setSuspendForm({ ...suspendForm, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={suspendForm.reason}
              onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuspendDialog(false)} className="btn cancel">
            Cancel
          </Button>
          <Button onClick={handleSuspendUser} className="btn" style={{ backgroundColor: '#ff9800' }}>
            Suspend User
          </Button>
        </DialogActions>
      </Dialog>


      {/* ========== SEND EMAIL DIALOG ========== */}
      <Dialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Email to {emailForm.username}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="To"
              value={emailForm.email}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Subject *"
              name="subject"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message *"
              name="message"
              value={emailForm.message}
              onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
              margin="normal"
              multiline
              rows={6}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailDialog(false)} className="btn cancel">
            Cancel
          </Button>
          <Button onClick={handleSendEmail} className="btn" style={{ backgroundColor: '#2196f3' }}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}