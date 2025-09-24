import React from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Regularaccountuser.css";
import sweetledger from"../assets/sweetledger.jpeg";
import { useNavigate } from "react-router-dom";

export default function Regularaccountuser({setIsLoggedIn}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication data (adjust depending on your setup)
    localStorage.removeItem("token");
    sessionStorage.clear();

    // Reset login state
    setIsLoggedIn(false);

    // Redirect to login page
    navigate("/");
  };

   return (
       <div className="regularaccountuser-container">
         {/* Header with Porfile */}
         <header className="regularaccountuser-header">
   
           <h1 className="regularaccountuser-title">Account User Dashboard</h1>
           
           <img src={sweetledger} alt="Logo" className="logo-pic" />
           <img src={defaultProfile} alt="Profile" className="profile-pic"/>
           <button className="logout-btn" onClick={handleLogout}>Logout</button>
         </header>
   
         {/* Page Content*/}
   
         
       </div>
     );
}