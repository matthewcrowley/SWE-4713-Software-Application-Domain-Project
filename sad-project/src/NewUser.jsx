import {useState} from "react";
import"./style.css";

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
      setMessage("Username must be at least 8 characters.")
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

        const hashed = await hashedPassword(password);

        try {
            // Send to backend
            const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            setMessage("Registration successful! Await admin approval.");
            } else {
            setMessage("Registration failed: " + data.message);
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

  return (
    <div className="app-wrapper">
      <div className="login-container">
        <h2>Create New User</h2>

        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email Address:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button id="createAccountBtn" onClick={handleCreateAccount}>
          Submit Request
        </button>

        <div
          id="message"
          className={message.includes("submitted") ? "success" : ""}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

export default NewUser