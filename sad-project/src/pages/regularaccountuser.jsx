import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Regularaccountuser.css";
import logo from "../assets/sweetledger.jpeg";

export default function Regularaccountuser({ setIsLoggedIn }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
    const data = {acctType: 'accountant'}


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.warn("Could not fetch /api/me:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const services = [
    {
      title: "Account Management",
      description: "view accounts",
      icon: "👥",
      path: "/accountview", // Added path for navigation
    },
    {
      title: "Chart of Accounts",
      description: "View and filter all accounts",
      icon: "📄",
      path: "/chartofaccounts",
    },
    {
      title: "Event Logs",
      description: "View system activity and changes",
      icon: "📈",
      path: "/eventlog",
    },
    {
      title: "Reports",
      description: "Generate financial reports",
      icon: "📊",
    },
    {
      title: "Journal Entries",
      description: "Record transactions",
      icon: "➕",
    },
    {
      title: "Search",
      description: "Find accounts and transactions",
      icon: "🔍",
    },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  // Navigate to a service (only Account Management has a route for now)
  const handleServiceClick = (service) => {
    if (service.path) {
      navigate({pathname: service.path,
        state: data
      });
    } else {
      alert(`"${service.title}" service is not available yet.`);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="logo-section">
            <img src={logo} alt="SweetLedger Logo" className="header-logo" />
            <div>
              <h2 className="company-name">SweetLedger</h2>
              <p className="company-subtitle">Accounting Management System</p>
            </div>
          </div>

          <div className="user-section">
            <span className="welcome-text">Welcome,</span>
            <div>
              <div className="username">
                {currentUser?.username || "martyjohnson12#"}
              </div>
              <span className="regularuser-badge">RegUser</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <button className="nav-button">👤 Accounts</button>
          <button className="nav-button">🏠 Dashboard</button>
          <button className="nav-button">📋 Chart</button>
          <button className="nav-button">📝 Event Log</button>
          <button className="nav-button">📖 Journal</button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p className="dashboard-tagline">Select a service to get started</p>

        {/* Service Cards */}
        <div className="service-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <button
                className="access-button"
                onClick={() => handleServiceClick(service)}
              >
                Access Service
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
