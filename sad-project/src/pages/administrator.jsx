import React from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Admin.css";

export default function Administrator() {
  return (
    <div className="admin-container">
      {/* Header with Porfile */}
      <header className="admin-header">

        <h1 className="admin-title">Administrator Dashboard</h1>

        <img
          src={defaultProfile} alt="Profile" className="profile-pic"/> 
      </header>

      {/* Page Content*/}

      
    </div>
  );
}