import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import "./style.css";
import NewUser from "./NewUser";
import ForgotPassword from "./ForgotPassword";
import { Link } from "react-router-dom";
import logo from "./assets/sweetledger.jpeg";
import Administrator from "./pages/administrator";
import Manager from "./pages/manager";
import Regularaccountuser from "./pages/regularaccountuser";
import AccountManagement from "./pages/accountmanagement"; // ✅ FIXED - lowercase filename

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ===== Login Page Component =====
  function LoginPage({ setIsLoggedIn }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Hash password with SHA-256
    async function hashedPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    const handleLogin = async () => {
      setMessage("");

      if (!username || !password) {
        setMessage("Please enter both fields.");
        return;
      }
      if (username.length < 8) {
        setMessage("Username must be at least 8 characters.");
        return;
      }
      if (password.length < 8) {
        setMessage("Password must be at least 8 characters.");
        return;
      }
      if (!/^[A-Za-z]/.test(password)) {
        setMessage("Password must start with a letter.");
        return;
      }
      if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(password)) {
        setMessage("Password must contain at least one letter, one number, and one special character.");
        return;
      }

      setMessage("Processing...");

      const hashed = await hashedPassword(password);
      console.log("Username:", username);
      console.log("Hashed password:", hashed);

      // Mark user as logged in
      setIsLoggedIn(true);

      if (password === "Administrator#01") {
        navigate("/administrator");
      } else if (password === "Manageruser#02") {
        navigate("/manager");
      } else if (password === "Accountuser#03") {
        navigate("/regularaccountuser");
      } else {
        setIsLoggedIn(false);
        setMessage("Invalid input for role-based login.");
        return;
      }
    };

    const handleCreateUser = () => navigate("/new-user");
    const handleClear = () => {
      setUsername("");
      setPassword("");
      setMessage("");
    };

    return (
      <div className="login-container">
        <div className="login-card">
          <img src={logo} alt="SweetLedger Logo" className="login-logo-img" />

          <h1 className="login-title">SweetLedger</h1>
          <p className="login-subtitle">Accounting Management System</p>

          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="userinput"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="passinput"
              />
            </div>

            <button data-testid="loginbtn" className="login-button" onClick={handleLogin}>
              Sign In
            </button>

            <button className="create-account-btn" data-testid="Newuserbtn" onClick={handleCreateUser}>
              Create New Account
            </button>

            <button className="clear-btn" onClick={handleClear}>
              Clear
            </button>
          </div>

          <Link to="/forgot-password" className="forgot-password">
            Forgot Password?
          </Link>

          {message && (
            <div className={`message ${message.includes("Processing") ? "success" : ""}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== App Routes =====
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/new-user" element={<NewUser />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes - pass setIsLoggedIn to enable logout */}
        <Route
          path="/administrator"
          element={
            isLoggedIn ? (
              <Administrator setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/manager"
          element={
            isLoggedIn ? (
              <Manager setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/regularaccountuser"
          element={
            isLoggedIn ? (
              <Regularaccountuser setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ✅ Account Management Page */}
        <Route
          path="/accountmanagement"
          element={
            isLoggedIn ? <AccountManagement /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
