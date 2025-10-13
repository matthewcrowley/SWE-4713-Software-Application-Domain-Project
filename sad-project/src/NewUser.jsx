import {useState} from "react";
import"./style.css";
import { useNavigate, Link } from "react-router-dom";
import logo from "./assets/sweetledger.jpeg";

function NewUser() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        dob: "",
        email: "",
        username: "",
        password: "",
    })

    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // navigate hook

     //Hash password with SHA-256
  async function hashedPassword(password)
  {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

    const validatePassword = (password) => {
        if(!/^[A-Za-z]/.test(password)) {
      setMessage("Password must start with a letter.")
      return false;
    }
    if(!/(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(password)) {
      setMessage("Password must contain at least one letter, one number, and one special character.")
      return false;
    }
    if(password.length < 8) {
      setMessage("Password must be at least 8 characters.")
      return false;
    }
        return true;
    };

    const handleCreateAccount = async () => {
        const{ firstName, lastName, address, dob, email, username, password } = formData;

         if(!firstName || !lastName || !address || !dob || !email || !username || !password) {
            setMessage("Please fill all fields.");
            return;
         }

         if(username.length < 8) {
            setMessage("Username must be at least 8 characters.")
            return;
        }

        if(!validatePassword(password)) return;

        if(password === "Administrator#01") {
          setMessage("Administrator login created!");
          navigate("/administrator"); // sends user to admin dashboard
          return;
        }

        if(password === "Manageruser#02") {
          setMessage("Manager login created!");
          navigate("/manager"); // sends user to manager dashboard
        }

        if(password === "Accountuser#03") {
          setMessage("Regular account user login created!");
          navigate("/regularaccountuser"); // sends user to account user dashboard
        }

        const hashed = await hashedPassword(password);

        try {
            // Send to backend
            const response = await fetch('http://localhost:3000/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName,
                lastName,
                address,
                dob,
                email,
                username,
                passwordHash: hashed,
              }),
            });
            const data = await response.json();

            if (data.success) {
              setMessage('Registration successful! Await admin approval.');
            } else {
              setMessage('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error("Error registering user:", error);
            setMessage("Server error. Please try again later.");
        }

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      dob: "",
      email: "",
      username: "",
      password: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
  };

  const handleClear = () => {
    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      dob: "",
      email: "",
      username: "",
      password: "",
    });
    setMessage("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="SweetLedger Logo" className="login-logo-img" />
        
        <h1 className="login-title">SweetLedger</h1>
        <p className="login-subtitle">Create New Account</p>

        <div className="login-form">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-input"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-input"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="form-input"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="login-button" onClick={handleCreateAccount}>
            Submit Request
          </button>

          <button className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>

        <Link to="/" className="forgot-password">
          Back to Login
        </Link>

        {message && (
          <div className={`message ${message.toLowerCase().includes("successful") ? "success" : ""}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewUser;