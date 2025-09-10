import React from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Manager.css"

export default function Manager() {
   return (
       <div className="manager-container">
         {/* Header with Porfile */}
         <header className="manager-header">
   
           <h1 className="manager-title">Manager Dashboard</h1>
   
           <img
             src={defaultProfile} alt="Profile" className="profile-pic"/> 
         </header>
   
         {/* Page Content*/}
   
         
       </div>
     );
}