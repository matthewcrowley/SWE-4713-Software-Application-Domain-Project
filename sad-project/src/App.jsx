import { useState } from 'react'

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  //Hash password with SHA-256
  async function hashedPassword(password)
  {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("CHA-230", data);
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
    }
    if(password.length < 8) {
      setMessage("Passowrd must be at least 8 characters.")
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
    <div className="login-container">
      <h2>Login</h2>

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
        <label htmlFor="password">Passoword:</label>
        <input
          type="text"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /> 
      </div>

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleCreateUser}>New User</button>

      <a href="#" id="forgotPassword">Forgot Password</a>

      <div id="message">{message}</div>
    </div>
  );
}

export default App;
