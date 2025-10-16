import {useState} from "react";
import"./style.css";
import logo from "./assets/sweetledger.jpeg";
import { useNavigate, Link } from "react-router-dom";
import HelpButton from "./components/HelpButton";

function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleClear = () => {
        setUsername("");
        setEmail("");
        setSecurityAnswer("");
        setNewPassword("");
        setMessage("");
    };

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
        setTimeout(() => {
            navigate("/");
        }, 2000);
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
                                    onChange={e => setUsername(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                />
                            </div>
                            <button className="login-button" onClick={handleStep1}>Next</button>
                            <button className="clear-btn" onClick={handleClear}>Clear</button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="form-group"> 
                                <label className="form-label">Security Question</label>
                                <p style={{fontSize: "14px", color: "#7F8C8D", marginBottom: "8px"}}>
                                    What is your favorite color?
                                </p>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    placeholder="Enter your answer"
                                    value={securityAnswer} 
                                    onChange={e => setSecurityAnswer(e.target.value)} 
                                />
                            </div>
                            <button className="login-button" onClick={handleStep2}>Next</button>
                            <button className="clear-btn" onClick={handleClear}>Clear</button>
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
                                    onChange={e => setNewPassword(e.target.value)} 
                                />
                            </div>
                            <button className="login-button" onClick={handleStep3}>Reset Password</button>
                            <button className="clear-btn" onClick={handleClear}>Clear</button>
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