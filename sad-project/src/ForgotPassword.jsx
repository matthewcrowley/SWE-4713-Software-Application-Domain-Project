import { useState } from "react";
import "./style.css";
import logo from "./assets/sweetledger.jpeg";
import { useNavigate, Link } from "react-router-dom";
import HelpButton from "./components/HelpButton";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [securityAnswer3, setSecurityAnswer3] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleClear = () => {
    setUsername("");
    setEmail("");
    setSecurityAnswer1("");
    setSecurityAnswer2("");
    setSecurityAnswer3("");
    setNewPassword("");
    setMessage("");
  };

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const validatePassword = (password) => {
    if (!/^[A-Za-z]/.test(password)) {
      setMessage("Password must start with a letter.");
      return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?-])/.test(password)) {
      setMessage("Password must contain at least one letter, one number, and one special character.");
      return false;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleStep1 = async () => {
    if (!username || !email) {
      setMessage("Please enter both your username and email.");
      return;
    }

    try {
      const res = await fetch("https://swe-4713-software-application-domain.onrender.com/api/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("");
        setStep(2);
      } else {
        setMessage(data.message || "The user verification failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("There was a server error.");
    }
  };

  const handleStep2 = async () => {
    if (!securityAnswer1 || !securityAnswer2 || !securityAnswer3) {
      setMessage("Please answer all of the security questions.");
      return;
    }

    try {
      const res = await fetch("https://swe-4713-software-application-domain.onrender.com/api/verify-security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          a1: securityAnswer1,
          a2: securityAnswer2,
          a3: securityAnswer3,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("");
        setStep(3);
      } else {
        setMessage(data.message || "The answers you inputted for the security questions were incorrect.");
      }
    } catch (err) {
      console.error(err);
      setMessage("There was a server error.");
    }
  };

  const handleStep3 = async () => {
    if (!newPassword) {
      setMessage("Please enter your new password.");
      return;
    }
    if (!validatePassword(newPassword)) return;

    const hashed = await hashPassword(newPassword);

    try {
      const res = await fetch("https://swe-4713-software-application-domain.onrender.com/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passwordHash: hashed, passwordUpdatedAt: new Date() }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Your password has been successfully reset!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.message || "Your password failed to reset.");
      }
    } catch (err) {
      console.error(err);
      setMessage("There was a server error.");
    }
  };

  return (
    <div className="login-container">
      <HelpButton />
      <div className="login-card">
        <img src={logo} alt="SweetLedger Logo" className="login-logo-img" />
        <h1 className="login-title">SweetLedger</h1>
        <p className="login-subtitle">
          {step === 1 && "Reset Your Password - Step 1 of 3"}
          {step === 2 && "Reset Your Password - Step 2 of 3"}
          {step === 3 && "Reset Your Password - Step 3 of 3"}
        </p>

        <div className="login-form">
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="login-button" onClick={handleStep1}>
                Next
              </button>
              <button className="clear-btn" onClick={handleClear}>
                Clear
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Security Questions</label>
                <p style={{ fontSize: "14px", color: "#7F8C8D", marginBottom: "8px" }}>
                  What is your favorite color?
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your answer"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                />
                <p style={{ fontSize: "14px", color: "#7F8C8D", marginBottom: "8px" }}>
                  What was your first car?
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your answer"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                />
                <p style={{ fontSize: "14px", color: "#7F8C8D", marginBottom: "8px" }}>
                  What was the name of your first pet?
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your answer"
                  value={securityAnswer3}
                  onChange={(e) => setSecurityAnswer3(e.target.value)}
                />
              </div>
              <button className="login-button" onClick={handleStep2}>
                Next
              </button>
              <button className="clear-btn" onClick={handleClear}>
                Clear
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button className="login-button" onClick={handleStep3}>
                Reset Password
              </button>
              <button className="clear-btn" onClick={handleClear}>
                Clear
              </button>
            </>
          )}
        </div>

        <Link to="/" className="forgot-password">
          Back to Login
        </Link>

        {message && (
          <div className={`message ${message.includes("success") ? "success" : ""}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;