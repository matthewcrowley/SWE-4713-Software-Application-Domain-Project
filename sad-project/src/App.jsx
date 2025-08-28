import { useState } from 'react'
import "./style.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  //Hash password with SHA-256
  async function hashedPassword(password)
  {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const handleLogin = async() => {
    setMessage("");

    if(!username || !password) {
      setMessage("Please enter both fields.")
      return;
    }
    if(username.length < 8) {
      setMessage("Username must be at least 8 characters.")
      return;
    }
    if(password.length < 8) {
      setMessage("Password must be at least 8 characters.")
      return;
    }
    
    setMessage("Processing...");

    const hashed = await hashedPassword(password);
    console.log("Username:", username);
    console.log("Hashed password:", hashed);

    setMessage("Login successful.");
  };

  const handleCreateUser = () => {
    setMessage("Redirecting to New User page...")
  };

  return (
    <div className="app-wrapper">
    <div className="login-container">
      <h2>Sweet Ledger</h2>

      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        /> 
      </div>

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /> 
      </div>

      <button id="loginBtn" onClick={handleLogin}>Login</button>
      <button id="createUserBtn" onClick={handleCreateUser}>New User</button>

      <a href="#" id="forgotPassword">Forgot Password</a>

      <div id="message">{message}</div>
      </div>
     </div>
  );
}

export default App;
