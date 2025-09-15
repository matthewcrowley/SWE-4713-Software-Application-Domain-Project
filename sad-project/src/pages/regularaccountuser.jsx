import React from "react";
import defaultProfile from"../assets/defaultprofile.png";
import "./Regularaccountuser.css"

export default function Manager() {
   return (
       <div className="regularaccountuser-container">
         {/* Header with Porfile */}
         <header className="regularaccountuser-header">
   
           <h1 className="regularaccountuser-title">Account User Dashboard</h1>
   
           <img
             src={defaultProfile} alt="Profile" className="profile-pic"/> 
         </header>
   
         {/* Page Content*/}
   
         
       </div>
     );
}