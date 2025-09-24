import {useState} from "react";
import"./style.css";
import logo from "./assets/sweetledger.jpeg";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    // validate password rules
    const validatePassword = (password) => {
    if(!/^[A-Za-z]/.test(password)) {
      setMessage("Password must start with a letter.")
      return false;
    }
    if(!/(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(password)) {
      setMessage("Password must contain at least one letter, one number, and one special character.")
      return false;
    }
    return true;
  };

  const handleStep1 = async () => {
    if(!username || !email){
        setMessage("Please enter both username and email.")
        return;
    }
    console.log("Verfying username/email: ", username, email);

    setMessage("");
    setStep(2);
  }

  const handleStep2 = async () => {
    if(!securityAnswer) {
        setMessage("Please enter the security question.")
        return;
    }

    // Verify security question with backend
    console.log("Security answer: ", securityAnswer);

    setMessage("");
    setStep(3);
  }

  const handleStep3 = async () => {
    if(!newPassword) {
        setMessage("Please enter a new password");
        return;
    }

    if(!validatePassword(newPassword)) return;

    //Later update password in backend (SQL server) after hashing
    console.log("New password for user: ", username);

    setMessage("Password has been successfully reset!");
    setStep(1);
    setUsername("");
    setEmail("");
    setSecurityAnswer("");
    setNewPassword("");
  };

  return (
    <div className="app-wrapper">
        <div className="login-container">
            <h2>Forgot Password</h2>

            {step === 1 &&  (
                <>
                    <div className="form-group">
                        <img src={logo} alt="Logo" className="logo" />
                        <label>Username:</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                    <button className="btn back-btn" onClick={() => navigate("/")}>
                        Back
                    </button>
                    <button id="forgotPasswordBtn" onClick={handleStep1}>Next</button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                <div className="form-group"> 
                    <label>Security Question: What is your favorite color?</label>
                    <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                    </div>
                    <div className="form-group">
                    <button className="btn back-btn" onClick={() => navigate("/")}>
                        Back
                    </button>
                    <button id="forgotPasswordBtn" onClick={handleStep2} >Next</button>
                    </div>
                </>
            )}

            { step === 3 && (
                <>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                    <button className="btn back-btn" onClick={() => navigate("/")}>
                        Back
                    </button>
                    <button id="forgotPasswordBtn" onClick={handleStep3}>Reset Password</button>
                    </div>
                </>
            )}

            <div id="message" className={message.includes("success") ? "success" : ""}>{message}</div>
        </div>
    </div>
  );
}

export default ForgotPassword;