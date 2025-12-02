import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Regularaccountuser.css";
import logo from "../assets/sweetledger.jpeg";
import HelpButton from "../components/HelpButton";
import Calendar from "../components/Calendar";

function PendingJournalEntries() {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:3000/api/journal-entries");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const allEntries = await res.json();

        setPendingEntries(allEntries.filter(entry => entry.status === "pending"));
      } catch (err) {
        console.error("Failed to fetch journal entries:", err);
        setError("Could not load pending journal entries.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) return <p>Loading pending journal entries...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (pendingEntries.length === 0) return null;

  return (
    <section className="pending-journal-entries alert alert-warning" style={{ color: "red" }}>
      <h3>!!! Important Notifications !!!</h3>
      <p>
        There {pendingEntries.length > 1 ? "are" : "is"} {pendingEntries.length} journal {pendingEntries.length > 1 ? "entries" : "entry"} waiting for a manager's approval:
      </p>
      <ul>
        {pendingEntries.map((entry) => (
          <li key={entry._id}>
            {entry.createdBy + " created "}
            {entry.description}
            {entry.comment}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Regularaccountuser({ setIsLoggedIn }) {
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

  // Define threshold ranges for each ratio
  const getRatioStatus = (key, value) => {
    const thresholds = {
      // Profitability Ratios (higher is better)
      grossProfitMargin: { good: 0.30, warning: 0.20 },
      operatingProfitMargin: { good: 0.15, warning: 0.10 },
      netProfitMargin: { good: 0.10, warning: 0.05 },
      returnOnAssets: { good: 0.10, warning: 0.05 },
      returnOnEquity: { good: 0.15, warning: 0.10 },
      returnOnCommonEquity: { good: 0.15, warning: 0.10 },

      // Liquidity Ratios (range-based)
      currentRatio: { good: 1.5, warning: 1.0, tooHigh: 3.0 },
      quickRatio: { good: 1.0, warning: 0.75, tooHigh: 2.5 },
      inventoryToNetWorkingCapital: { good: 0.5, warning: 0.7, tooHigh: 1.0 },

      // Leverage Ratios (lower is better)
      debtToAssets: { good: 0.40, warning: 0.60 },
      debtToEquity: { good: 0.50, warning: 1.0 },
      longTermDebtToEquity: { good: 0.30, warning: 0.60 },
      timesInterestEarned: { good: 5.0, warning: 2.5 },

      // Activity Ratios (higher is better)
      inventoryTurnover: { good: 6.0, warning: 4.0 },
      fixedAssetTurnover: { good: 2.0, warning: 1.0 },
      totalAssetTurnover: { good: 1.0, warning: 0.5 },
      accountsReceivableTurnover: { good: 8.0, warning: 5.0 },
      averageCollectionPeriod: { good: 45, warning: 60 }, // lower is better for collection period
    };

    const threshold = thresholds[key];
    if (!threshold) return 'neutral';

    // Special handling for different ratio types
    if (key === 'currentRatio' || key === 'quickRatio') {
      // Range-based: too low or too high is bad
      if (value >= threshold.good && value <= threshold.tooHigh) return 'good';
      if (value >= threshold.warning || (value > threshold.tooHigh && value <= threshold.tooHigh * 1.2)) return 'warning';
      return 'danger';
    }

    if (key === 'inventoryToNetWorkingCapital') {
      // Lower is better, but zero is problematic
      if (value <= threshold.good && value > 0) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'danger';
    }

    if (key === 'debtToAssets' || key === 'debtToEquity' || key === 'longTermDebtToEquity' || key === 'averageCollectionPeriod') {
      // Lower is better
      if (value <= threshold.good) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'danger';
    }

    // For most ratios, higher is better
    if (value >= threshold.good) return 'good';
    if (value >= threshold.warning) return 'warning';
    return 'danger';
  };

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
        const timeoutId = setTimeout(() => controller.abort(), 7000);
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
          return;
        } catch (err) {
          clearTimeout(timeoutId);
          console.warn(`Attempt ${attempt} failed to fetch financial ratios:`, err);
          if (attempt < maxAttempts) {
            await sleep(400 * Math.pow(2, attempt));
            continue;
          }

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
      description: "view accounts",
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
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

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
      <header className="dashboard-header">
        <div className="header-top">
          <div className="logo-section">
            <img 
            src={logo} 
            alt="SweetLedger Logo" 
            style={{ width: '100px', height: 'auto' }}
            className="header-logo" />
            <div>
              <h2 className="company-name">SweetLedger</h2>
              <p className="company-subtitle">Accounting Management System</p>
            </div>
          </div>

          <div className="user-section">
            <span className="welcome-text">Welcome,</span>
            <div>
              <div className="username">
                {currentUser?.curUsername || "matthewwilliam#1"}
              </div>
              <span className="regularuser-badge">Accountant</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="button-container">
            <Calendar title="Calender" />
            <span className="tooltiptext">Click here to open the calendar</span>
          </div>
          <button className="nav-button" onClick={() => navigate("/regularaccountuser")}>
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

      <main className="dashboard-main">
        <h1 className="dashboard-title">Accountant Dashboard</h1>
        <p className="dashboard-tagline">Select a service to get started</p>

        <section className="ratios-section">
          <h2 className="section-title">Financial Ratios</h2>
          {ratiosLoading ? (
            <div>Loading ratios...</div>
          ) : ratiosError ? (
            <div className="error">{ratiosError}</div>
          ) : ratios ? (
            <div className="ratios-grid">
              {Object.entries(ratios).map(([key, value]) => {
                let safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

                const percentageRatios = [
                  "grossProfitMargin",
                  "operatingProfitMargin",
                  "netProfitMargin",
                  "returnOnAssets",
                  "returnOnEquity",
                  "returnOnCommonEquity",
                  "dividendYield"
                ];

                const displayValue = percentageRatios.includes(key)
                  ? (safeValue * 100).toFixed(2) + "%"
                  : safeValue.toFixed(2);

                const status = getRatioStatus(key, safeValue);

                return (
                  <div key={key} className={`ratio-card ratio-${status}`}>
                    <div className="ratio-title">{formatKey(key)}</div>
                    <div className="ratio-value">{displayValue}</div>
                    <div className={`ratio-indicator ${status}`}></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>No ratios available.</div>
          )}
        </section>

        <PendingJournalEntries />

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