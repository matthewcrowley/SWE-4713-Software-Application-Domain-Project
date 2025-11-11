import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Manager.css";
import logo from "../assets/sweetledger.jpeg";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";
import NotificationsWrapper from "../components/NotificationsWrapper";


export default function Manager({ setIsLoggedIn }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Financial ratios state
  const [ratios, setRatios] = useState(null);
  const [ratiosLoading, setRatiosLoading] = useState(false);
  const [ratiosError, setRatiosError] = useState('');

  // Helper to make keys readable
  const formatKey = (k) =>
    k
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^./, (s) => s.toUpperCase());

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

    // Fetch financial ratios for the dashboard
      useEffect(() => {
        const fetchRatios = async () => {
          setRatiosLoading(true);
          const url = "http://localhost:3000/api/financial-ratios";
          const maxAttempts = 3;
    
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout
            try {
              const res = await fetch(url, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${txt}`);
              }
              const data = await res.json();
              if (!data || Object.keys(data).length === 0) {
                throw new Error("Empty ratios payload");
              }
              setRatios(data);
              setRatiosError("");
              try {
                localStorage.setItem("financialRatiosCache", JSON.stringify(data));
              } catch (err) {
                console.warn("Could not cache financial ratios:", err);
              }
              return; // success
            } catch (err) {
              clearTimeout(timeoutId);
              console.warn(`Attempt ${attempt} failed to fetch financial ratios:`, err);
              if (attempt < maxAttempts) {
                // exponential backoff before retrying
                await sleep(400 * Math.pow(2, attempt));
                continue;
              }
    
              // final attempt failed — try cache then fallback
              try {
                const cached = localStorage.getItem("financialRatiosCache");
                if (cached) {
                  setRatios(JSON.parse(cached));
                  setRatiosError("Loaded cached ratios (offline)");
                  return;
                }
              } catch (err) {
                console.warn("Could not read cached financial ratios:", err);
              }
              
              const fallback = {
                currentRatio: 1.75,
                quickRatio: 1.2,
                debtToEquity: 0.45,
                grossProfitMargin: 0.33,
              };
              setRatios(fallback);
              setRatiosError("Loaded fallback ratios (couldn't reach server)");
            } finally {
              setRatiosLoading(false);
            }
          }
        };
        fetchRatios();
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
      title: "Financial Reports",
      description: "Generate financial reports",
      icon: "📊",
      path: "/Reports",
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
            <NotificationsWrapper />
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
            📖 Journalize
          </button>
          <button className="nav-button" onClick={() => navigate("/reports")}>
            📊 Financial Reports
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Manager Dashboard</h1>
        <p className="dashboard-tagline">Select a service to get started</p>

       {/* Financial Ratios Dashboard */}
      <section className="ratios-section">
        <h2 className="section-title">Financial Ratios</h2>
        {ratiosLoading ? (
          <div>Loading ratios...</div>
        ) : ratiosError ? (
          <div className="error">{ratiosError}</div>
        ) : ratios ? (
          <div className="ratios-grid">
            {Object.entries(ratios).map(([key, value]) => {
              // Make sure value is a valid number
              let safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

              // List of ratios to display as percentages
              const percentageRatios = [
                "grossProfitMargin",
                "operatingProfitMargin",
                "netProfitMargin",
                "returnOnAssets",
                "returnOnEquity",
                "returnOnCommonEquity",
                "dividendYield"
              ];

              // Format value
              const displayValue = percentageRatios.includes(key)
                ? (safeValue * 100).toFixed(2) + "%"
                : safeValue.toFixed(2);

              return (
                <div key={key} className="ratio-card">
                  <div className="ratio-title">{formatKey(key)}</div>
                  <div className="ratio-value">{displayValue}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>No ratios available.</div>
        )}
      </section>

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
