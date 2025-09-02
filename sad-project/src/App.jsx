
import {BrowserRouter as Router, Routes, Route, useNavigate, Navigate} from "react-router-dom";
import { useState } from 'react'
import "./style.css";
import NewUser from './NewUser';
import ForgotPassword from "./ForgotPassword";
import { Link } from "react-router-dom"; 
import logo from "./assets/sweetledger.jpeg";

// Login Page
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

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
    if(!/^[A-Za-z]/.test(password)) {
      setMessage("Password must start with a letter.")
      return;
    }
    if(!/(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(password)) {
      setMessage("Password must contain at least one letter, one number, and one special character.")
      return;
    }
    
    setMessage("Processing...");

    const hashed = await hashedPassword(password);
    console.log("Username:", username);
    console.log("Hashed password:", hashed);

    setMessage("Login successful.");
  };

  const handleCreateUser = () => {
    navigate("/new-user");
  };

  return (
    <div className="app-wrapper">
    <div className="login-container">
      
      <div className="form-group">
        <img src={logo} alt="Logo" className="logo" />
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

      <Link to="/forgot-password" id="forgotPassword">
        Forgot Password?
      </Link>

      <div id="message">{message}</div>
      </div>
     </div>
  );
}

function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/new-user" element={<NewUser />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
