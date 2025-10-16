import React, { useState } from 'react';
import './HelpButton.css';

const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    "Getting Started": {
      "What is SweetLedger?": "SweetLedger is a comprehensive accounting management system designed to help businesses manage their financial accounts, users, and transactions efficiently.",
      "Key Features": "Some key features include account management, transaction tracking, and reporting."
    },
    "Navigation": {
      "Dashboard": "The main page where you can access all available services and features based on your role.",
      "Navigation Bar": "Use the navigation buttons to quickly switch between different sections: Dashboard, Accounts, Chart, Event Log, and Journal.",
      "Service Cards": "Click on service cards to access specific features like Account Management, Chart of Accounts, Event Logs, Reports, Journal Entries, and Search."
    },
    "Account Management": {
      "Viewing Accounts": "All users can view account information including account name, number, category, balance, and statement type.",
      "Adding Accounts": "Administrators can add new accounts by filling out the account form with required information like name, number, description, and initial balance.",
      "Editing Accounts": "Administrators can edit existing account information by clicking the Edit button and making necessary changes.",
      "Account Categories": "Accounts are organized by categories such as Assets, Liabilities, Equity, Revenue, and Expenses."
    },
    "User Management": {
      "User Roles": "Administrators can assign and modify user roles (User, Manager, Admin) and activate/deactivate user accounts.",
      "User Status": "Users can be marked as Active or Inactive. Inactive users cannot log into the system.",
      "User Information": "View and edit user details including username, email, and role assignments."
    },
    "Reports & Logs": {
      "Event Logs": "Track all system activities and changes made by users for audit purposes.",
      "Chart of Accounts": "View a comprehensive list of all accounts organized by category and type.",
    },
    "Security & Access": {
      "Role-Based Access": "Different user roles have different levels of access to system features and data."
    },
    "Troubleshooting": {
      "Login Issues": "Ensure you're using the correct username and password format. Check that your account is active.",
      "Access Denied": "Some features may not be available based on your user role. Contact an administrator for access."
    },
    "Contact & Support": {
      "Technical Support": "For technical issues, contact your system administrator or IT support team.",
    }
  };

  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="help-container">
      <button 
        className="help-button" 
        onClick={toggleHelp}
        title="Click for help and information about SweetLedger"
      >
        ?
      </button>
      
      {isOpen && (
        <div className="help-modal-overlay" onClick={toggleHelp}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-header">
              <h2>SweetLedger Help Center</h2>
              <button className="help-close" onClick={toggleHelp}>×</button>
            </div>
            
            <div className="help-content">
              {Object.entries(helpContent).map(([category, topics]) => (
                <div key={category} className="help-category">
                  <h3 className="help-category-title">{category}</h3>
                  <div className="help-topics">
                    {Object.entries(topics).map(([topic, description]) => (
                      <div key={topic} className="help-topic">
                        <h4 className="help-topic-title">{topic}</h4>
                        <p className="help-topic-description">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="help-footer">
              <p>For additional support, contact your system administrator.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpButton;

