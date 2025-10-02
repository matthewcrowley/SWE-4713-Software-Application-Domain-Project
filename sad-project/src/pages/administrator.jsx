import React, { useState, useEffect } from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Admin.css";

export default function Administrator() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [editForm, setEditForm] = useState({username: "", email: "", role: "User"});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users")
        const data = await response.json();
        setUsers(data || []);
      }
      catch(error) {
        console.error("Error fetching user:", error);
        setMessage("Failed to load user.")
      }
      finally {
        setLoading(false);
      }
    };
      fetchUsers();
  }, []);

  // Start edit form changes
  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({username: user.username, email: user.email, role: user.role});
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditForm({...editForm, [e.target.name]: e.target.value});
  };

  const handleSuspend = (user) => {

  alert(`Suspend user: ${user.username}`);
};

const handleEmail = async (user) => {
  try {
    const response = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, username: user.username }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage(`Email sent to ${user.email}`);
    } else {
      setMessage(`Failed to send email: ${data.message}`);
    }
  } catch (error) {
    console.error("Email error:", error);
    setMessage("Server error while sending email.");
  }
};

  // Save user updates
  const saveUserUpdate = async () => {
    try{
      const response = await fetch(`http://localhost:3000/api/users/${editingUser}`, {
         method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(editForm), // Send fields directly
      })
    

    const data = await response.json();

     if(data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser ? {...u, ...editForm} : u))
      );
      setMessage(`User ID ${editingUser} updated successfully`);
      setEditingUser(null); // Close edit mode
      }
      else {
        setMessage("Failed to update user: " + data.message);
      }
    }

    catch(error) {
      console.error("Error updating role:", error);
      setMessage("Server error while updating user.")
    }

  }

  // Activate / Deactivate user
  const toggleUserStatus = async (user) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/status`, {
        method: "PUT",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({active: !user.active}),
      });

      const data = await response.json();

      if(data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? {...u, active: !u.active } : u)) 
        );
        setMessage(`User ${user.username} is now ${!user.active ? "active" : "inactive"}`);
      }
      else{
        setMessage("Failed to update status: " + data.message);
      }
    }
      catch(error) {
        console.error("Error updating status:", error);
        setMessage("Server error while updating status.");
    }
};

  return (
    <div className="admin-container">
      {/* Header with Porfile */}
      <header className="admin-header">

        <h1 className="admin-title">Administrator Dashboard</h1>

        <img
          src={defaultProfile} alt="Profile" className="profile-pic"/> 
      </header>

      <main className="admin-content">
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
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {editingUser === u.id ? (
                        <input
                          type="text"
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
                        <input
                          type="email"
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
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        >
                          <option value="User">User</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                        ) : (
                          u.role
                        )}
                    </td>
                    <td className= {u.active ? "status-active" : "status-inactive"}>
                        {u.active ? "Active" : "Inactive"}
                    </td> {/*Status Column*/}
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

                                  <button 
                                    className="btn suspend"
                                    onClick={() => handleSuspend(u)}
                                  >
                                    Suspend
                                  </button>

                                  <button 
                                    className="btn email"
                                    onClick={() => handleEmail(u)}
                                  >
                                    Email
                                  </button>
                                </>
                              )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
        </section>
        {message && <p className="status-message">{message}</p>}
      </main>
    </div>
  );
}