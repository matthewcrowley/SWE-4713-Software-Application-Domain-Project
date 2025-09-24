import React from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Manager.css";
import sweetledger from"../assets/sweetledger.jpeg";
import { useNavigate } from "react-router-dom";

export default function Manager(setIsLoggedIn) {

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
       <div className="manager-container">
         {/* Header with Porfile */}
         <header className="manager-header">
   
           <h1 className="manager-title">Manager Dashboard</h1>
          
           <img src={sweetledger} alt="Logo" className="logo-pic" />
           <img src={defaultProfile} alt="Profile" className="profile-pic"/>
           <button className="logout-btn" onClick={handleLogout}>Logout</button>
         </header>
   
         {/* Page Content*/}
   
         
       </div>
     );
}