import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { socket } from "./socket";
import { useEffect } from "react";
import "./style.css";
import NewUser from "./NewUser";
import ForgotPassword from "./ForgotPassword";
import { Link } from "react-router-dom";
import logo from "./assets/sweetledger.jpeg";
import Administrator from "./pages/administrator";
import Manager from "./pages/manager";
import Regularaccountuser from "./pages/regularaccountuser";
import AccountManagement from "./pages/AccountManagement";
import ViewAccounts from "./pages/Accountview";
import Eventlog from "./pages/Eventlog";
import Chartofaccounts from "./pages/Chartofaccounts";
import Ledger from "./pages/Ledger";
import Journal from './pages/Journal';
import HelpButton from "./components/HelpButton";
import AccountLedger from "./pages/AccountLedger"; 
import Reports from "./pages/Reports";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  var role = " "; // Placeholder for user role management
  var curUsername; 

  useEffect(() => {
  const handleConnect = () => {
    console.log("Connected to Socket.io:", socket.id);
  };

  const handleNewAdjustingEntry = (data) => {
    console.log("Received new adjusting entry:", data);
  };

  socket.on("connect", handleConnect);
  socket.on("new-adjusting-entry", handleNewAdjustingEntry);

  // Cleanup when component unmounts
  return () => {
    socket.off("connect", handleConnect);
    socket.off("new-adjusting-entry", handleNewAdjustingEntry);
  };
}, []);

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

      setMessage("Processing...");

      const hashed = await hashedPassword(password);
      console.log("Username:", username);
      console.log("Hashed password:", hashed);

      try {
          const response = await fetch("http://localhost:3000/api/users");
          const data = await response.json();
          const user = data.find((u) => u.username === username);  
          
          if(user.suspended) {
            setMessage("Account is suspended. Please contact an administrator.");
            return;
          }
          
          if (user && (user.passwordHash == hashed)) {
            role = user.role;
            curUsername = user.username;
            setIsLoggedIn(true);
            console.log(curUsername)

            // POST current user info to /api/curUser
            try {
              const curUserResponse = await fetch("http://localhost:3000/api/curUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  curUsername,
                  role,
                  }),
                  });

                  if (!curUserResponse.ok) {
                    throw new Error("Failed to post current user");
                  }

                  console.log("Current user successfully posted to /api/curUser");
                } catch (error) {
                  console.error("Error uploading current user:", error);
                  setMessage("Server error. Please try again later.");
                }

                if (role === "Admin") {
                  navigate("/administrator");
                } else if (role === "Manager") {
                  navigate("/manager");
                } else if (role === "Accountant") {
                  navigate("/regularaccountuser");
                } else {
                  setIsLoggedIn(false);
                  setMessage("Invalid input for role-based login.");
                  return;
                }

          } else {

            // Wrong credentials — track failed attempts
            const failedAttempts = JSON.parse(sessionStorage.getItem("failedAttempts")) || {};
            failedAttempts[username] = (failedAttempts[username] || 0) + 1;

            if (failedAttempts[username] >= 3) {
              // Suspend user
              const suspendedUsers = JSON.parse(sessionStorage.getItem("suspendedUsers")) || {};
              suspendedUsers[username] = true;
              sessionStorage.setItem("suspendedUsers", JSON.stringify(suspendedUsers));
              setMessage("Account suspended after 3 failed login attempts.");

              await fetch(`http://localhost:3000/api/users/${username}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ suspended: true }),
              });
            }
            else 
            {   
                sessionStorage.setItem("failedAttempts", JSON.stringify(failedAttempts));
                setMessage(`Invalid username or password. (${failedAttempts[username]} of 3 attempts used)`);
            }
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setMessage("Failed to load users.");
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
        <HelpButton />
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

        <Route
          path="/ledger/:accountId"
          element={
            isLoggedIn ? <AccountLedger /> : <Navigate to="/" replace />
          }
        />

        {/* View Accounts Page (Read-Only for Regular Users) */}
        <Route
          path="/Accountview"
          element={
            isLoggedIn ? <ViewAccounts /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/eventlog"
          element={
            isLoggedIn ? <Eventlog /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/chartofaccounts"
          element={
            isLoggedIn ? <Chartofaccounts /> : <Navigate to="/" replace />
          }
        />

        {/* ✅ Journal Entry Routes - with optional highlighting parameter */}
        <Route
          path="/JournalEntries"
          element={
            isLoggedIn ? <Journal /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/journal/:highlightEntryId?"
          element={
            isLoggedIn ? <Journal /> : <Navigate to="/" replace />
          }
        />

        {/* ✅ Ledger Routes - with account ID parameter */}
        <Route
          path="/ledger"
          element={
            isLoggedIn ? <Ledger /> : <Navigate to="/" replace />
          }
          />

        {/* PR Journal entry*/}
        <Route 
          path="/journalentries/:journalEntryId" 
          element={<Journal />} 
          />
        <Route
          path="/ledger/:accountId"
          element={
            isLoggedIn ? <Ledger /> : <Navigate to="/" replace />
          }
        />
        {/* ✅ Financial Reports Route */}
      <Route
        path="/reports"
        element={
          isLoggedIn ? <Reports /> : <Navigate to="/" replace />
        }
      />
      </Routes>
    </Router>
  );
}

export default App;