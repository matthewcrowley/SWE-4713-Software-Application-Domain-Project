import React, { useState, useEffect } from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Admin.css";

export default function Administrator() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [editForm, setEditForm] = useState({username: "", email: "", role: "User"});

  //Account management states
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
    comment: ""
  });

  //help method for the 2 deciaml placements
  const formatMoney = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }

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

  // User edit handlers
  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveUserUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${editingUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

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
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
        );
        setMessage(`User ${user.username} is now ${!user.active ? "active" : "inactive"}`);
      } else {
        setMessage("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Server error while updating status.");
    }
  };

   // Account form handlers with 2-decimal formatting for monetary fields
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
      // Ensure all monetary values have 2 decimals
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
          comment: ""
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
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1 className="admin-title">Administrator Dashboard</h1>
        <button className="btn expired-password-report" onClick={() => setMessage("No Current Expired Passwords")}>
          Generate Expired Passwords Report
        </button>
        <img src={defaultProfile} alt="Profile" className="profile-pic" />
      </header>

      <main className="admin-content">
        {/* ===================== USER MANAGEMENT ===================== */}
        <section className="admin-section">
          <h2>User Management</h2>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {editingUser === u.id ? (
                        <input type="text" name="username" value={editForm.username} onChange={handleEditChange} />
                      ) : (
                        u.username
                      )}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <input type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <select name="role" value={editForm.role} onChange={handleEditChange}>
                          <option value="User">User</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td className={u.active ? "status-active" : "status-inactive"}>
                      {u.active ? "Active" : "Inactive"}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <>
                          <button className="btn" onClick={saveUserUpdate}>Save</button>
                          <button className="btn cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn" onClick={() => startEdit(u)}>Edit</button>
                          <button
                            className={`btn ${u.active ? "deactivate" : "activate"}`}
                            onClick={() => toggleUserStatus(u)}
                          >
                            {u.active ? "Deactivate" : "Activate"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/*ACCOUNT MANAGEMENT*/}
        <section className="admin-section">
          <h2>Account Management</h2>
          <form className="account-form" onSubmit={handleAddAccount}>
            <div className="form-grid">
              <input name="accountName" placeholder="Account Name" value={accountForm.accountName} onChange={handleAccountChange} required />
              <input name="accountNumber" placeholder="Account Number" value={accountForm.accountNumber} onChange={handleAccountChange} required />
              <input name="description" placeholder="Description" value={accountForm.description} onChange={handleAccountChange} />
              <select name="normalSide" value={accountForm.normalSide} onChange={handleAccountChange}>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
              <input name="category" placeholder="Category (e.g., Asset)" value={accountForm.category} onChange={handleAccountChange} />
              <input name="subcategory" placeholder="Subcategory (e.g., Current Assets)" value={accountForm.subcategory} onChange={handleAccountChange} />
              <input type="number" name="initialBalance" placeholder="Initial Balance" value={accountForm.initialBalance} onChange={handleAccountChange} />
              <input type="number" name="debit" placeholder="Debit" value={accountForm.debit} onChange={handleAccountChange} />
              <input type="number" name="credit" placeholder="Credit" value={accountForm.credit} onChange={handleAccountChange} />
              <input type="number" name="balance" placeholder="Balance" value={accountForm.balance} onChange={handleAccountChange} />
              <input name="userId" placeholder="User ID" value={accountForm.userId} onChange={handleAccountChange} />
              <input name="order" placeholder="Order (e.g., 01)" value={accountForm.order} onChange={handleAccountChange} />
              <select name="statement" value={accountForm.statement} onChange={handleAccountChange}>
                <option value="IS">Income Statement</option>
                <option value="BS">Balance Sheet</option>
                <option value="RE">Retained Earnings</option>
              </select>
              <input name="comment" placeholder="Comment" value={accountForm.comment} onChange={handleAccountChange} />
            </div>
            <button className="btn" type="submit">Add Account</button>
          </form>

          <h3>Existing Accounts</h3>
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
        </section>

        {message && <p className="status-message">{message}</p>}
      </main>
    </div>
  );
}