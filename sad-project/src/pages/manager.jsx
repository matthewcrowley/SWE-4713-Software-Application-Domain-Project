import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Manager.css";
import logo from "../assets/sweetledger.jpeg";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";

export default function Manager({ setIsLoggedIn }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

   useEffect(() => {
      const fetchCurrentUser = async () => {
        try {
          const response = await fetch("http://localhost:3000/api/curUser");
          const data = await response.json();
          setCurrentUser(data.currentUser || []);
          
        } catch (err) {
          console.warn("Could not fetch /api/curUser:", err);
        }
      };
      fetchCurrentUser();
    }, []);

  const services = [
    {
      title: "Account Management",
      description: "Add, view, edit, or deactivate accounts",
      icon: "👥",
      path: "/Accountview",
    },
    {
      title: "Chart of Accounts",
      description: "View and filter all accounts",
      icon: "📄",
      path: "/ChartofAccounts", 
    },
    {
      title: "Event Logs",
      description: "View system activity and changes",
      icon: "📈",
      path: "/EventLog",
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
      path: "/JournalEntries",
    },
    {
      title: "Search",
      description: "Find accounts and transactions",
      icon: "🔍",
    },
    {
          title: "Ledger",
          description: "Show ledger of Accounts",
          icon: "📙",
          path: "/Ledger"
    },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  // Navigate to a service (only Account Management has a route for now)
  const handleServiceClick = (service) => {
    if (service.path) {
      navigate(service.path);
    } else {
      alert(`"${service.title}" service is not available yet.`);
    }
  };

  return (
    <div className="dashboard-container">
      <HelpButton />
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
                {currentUser?.curUsername || "sarahbailey#1234"}
              </div>
              <span className="manager-badge">Manager</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <div className="button-container">
            <Calendar title="Calander" />
            <span className="tooltiptext">Click here to open the calendar</span>
          </div>
          <button className="nav-button" onClick={() => navigate("/manager")}>
            🏠 Dashboard
          </button>
          <button className="nav-button" onClick={() => navigate("/AccountView")}>
            👤 Account Management
          </button>
          <button className="nav-button" onClick={() => navigate("/chartofaccounts")}>
            📋 Chart of Accounts
          </button>
          <button className="nav-button" onClick={() => navigate("/eventlog")}>
            📝 Event Log
          </button>
          <button className="nav-button" onClick={() => navigate("/journalentries")}>
            📖 Journal Entries
          </button>
          <button className="nav-button" onClick={() => navigate("/ledger")}>
            📙 Ledger
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Manager Dashboard</h1>
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
