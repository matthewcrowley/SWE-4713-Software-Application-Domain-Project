import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';
import logo from "../assets/sweetledger.jpeg";
import './Journal.css';

const Journal = () => {
  const navigate = useNavigate();
  const { highlightEntryId } = useParams(); // For navigating from ledger to specific entry
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [showNewEntry, setShowNewEntry] = useState(false); 
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all'); // 'all', 'regular', 'adjusting'

  // Fetch current users
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

  // Highlight specific entry when navigating from ledger
  useEffect(() => {
    if (highlightEntryId && journalEntries.length > 0) {
      const entry = journalEntries.find(e => e._id === highlightEntryId);
      if (entry) {
        setSelectedEntry(entry);
        // Scroll to the entry if needed
        setTimeout(() => {
          const element = document.getElementById(`entry-${highlightEntryId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [highlightEntryId, journalEntries]);

  // New Entry Form State
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    isAdjustingEntry: false,
    attachments: [], // Array to store multiple files
    entries: [
      { accountId: '', accountName: '', debit: '', credit: '', type: 'debit' },
      { accountId: '', accountName: '', debit: '', credit: '', type: 'credit' }
    ]
  });

  // When PR is clicked in ledger --- open corresponding journal entry modal

  const { journalEntryId } = useParams(); // grab :id from URL

  useEffect(() => {
    if (!journalEntryId) return;

    // Check if already loaded in state
    const entry = journalEntries.find(e => e._id === journalEntryId);
    if (entry) {
      setSelectedEntry(entry);
    } else {
      // Otherwise fetch it from API
      fetch(`http://localhost:3000/api/journal-entries/${journalEntryId}`)
        .then(res => res.json())
        .then(data => setSelectedEntry(data))
        .catch(err => console.error(err));
    }
  }, [journalEntryId, journalEntries]);


  // Fetch Chart of Accounts
  useEffect(() => {
    fetchChartOfAccounts();
    fetchJournalEntries();
  }, []);

  const fetchChartOfAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setChartOfAccounts(data);
    } catch (err) {
      setError('Failed to load chart of accounts: ' + err.message);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/journal-entries');
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      const data = await response.json();
      setJournalEntries(data);
    } catch (err) {
      setError('Failed to load journal entries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for new entry
  const totals = useMemo(() => {
    const debitTotal = newEntry.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const creditTotal = newEntry.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
    return { debit: debitTotal, credit: creditTotal, balanced: debitTotal === creditTotal && debitTotal > 0 };
  }, [newEntry.entries]);

  const formatCurrency = (value) => {
  if (!value || value <= 0) return '-';
  return `$${parseFloat(value).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

  // Filter entries by status, date, search term, and entry type
  const filteredEntries = useMemo(() => {
    let entries = activeTab === "all"
      ? [...journalEntries]
      : journalEntries.filter(e => e.status === activeTab);
    
    // Filter by entry type (regular vs adjusting)
    if (entryTypeFilter !== 'all') {
      entries = entries.filter(e => {
        const isAdjusting = e.isAdjustingEntry === true;
        return entryTypeFilter === 'adjusting' ? isAdjusting : !isAdjusting;
      });
    }
    
    // Date filter
    if (dateFilter.start) {
      entries = entries.filter(e => e.date >= dateFilter.start);
    }
    if (dateFilter.end) {
      entries = entries.filter(e => e.date <= dateFilter.end);
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      entries = entries.filter(entry => {
        // Search in account names
        const accountMatch = entry.entries.some(e => 
          e.accountName?.toLowerCase().includes(search) ||
          e.accountId?.toLowerCase().includes(search)
        );
        
        // Search in amounts (debit or credit)
        const amountMatch = entry.entries.some(e => {
          const debitStr = e.debit ? e.debit.toString() : '';
          const creditStr = e.credit ? e.credit.toString() : '';
          return debitStr.includes(search) || creditStr.includes(search);
        });
        
        // Search in date
        const dateStr = new Date(entry.date).toLocaleDateString().toLowerCase();
        const dateMatch = dateStr.includes(search);
        
        // Search in description or entry ID
        const descMatch = entry.description?.toLowerCase().includes(search);
        const idMatch = entry.journalEntryNumber?.toString().includes(search) || 
                        entry._id?.slice(-6).toLowerCase().includes(search);
        
        return accountMatch || amountMatch || dateMatch || descMatch || idMatch;
      });
    }
    
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [journalEntries, activeTab, dateFilter, searchTerm, entryTypeFilter]);

  // Handle account selection
  const handleAccountChange = (index, accountId) => {
    const account = chartOfAccounts.find(a => a._id === accountId || a.account_number === accountId);
    const updated = [...newEntry.entries];
    updated[index] = { 
      ...updated[index], 
      accountId: account?.account_number || accountId, 
      accountName: account?.account_name || '' 
    };
    setNewEntry({ ...newEntry, entries: updated });
  };

  // Handle debit/credit input
  const handleAmountChange = (index, field, value) => {
    const updated = [...newEntry.entries];
    updated[index] = { ...updated[index], [field]: value };
    setNewEntry({ ...newEntry, entries: updated });
  };

  // Add line
  const addLine = (type) => {
  setNewEntry((prev) => ({
    ...prev,
    entries: [
      ...prev.entries,
      {
        type, // 👈 This is what determines where it shows
        accountId: '',
        accountName: '',
        debit: type === 'debit' ? '' : 0,
        credit: type === 'credit' ? '' : 0,
        attachment: null,
      },
    ],
  }));
};

  // Remove line
  const removeLine = (index) => {
    if (newEntry.entries.length > 2) {
      const updated = newEntry.entries.filter((_, i) => i !== index);
      setNewEntry({ ...newEntry, entries: updated });
    }
  };

  // Handle file uploads (multiple files)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File too large (max 5MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setNewEntry(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  // Remove an attachment
  const removeAttachment = (index) => {
    setNewEntry(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Submit new journal entry
  const submitEntry = async () => {
    if (!totals.balanced) {
      alert('Journal entry must be balanced (debits must equal credits)');
      return;
    }

    if (!newEntry.description.trim()) {
      alert('Please enter a description');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('date', newEntry.date);
      formData.append('description', newEntry.description);
      formData.append('status', 'pending');
      formData.append('isAdjustingEntry', newEntry.isAdjustingEntry);
      formData.append('createdBy', currentUser.curUsername);

      // Add entries
      const filteredEntries = newEntry.entries
        .filter(e => e.accountId && (parseFloat(e.debit) > 0 || parseFloat(e.credit) > 0))
        .map(e => ({
          accountId: e.accountId,
          accountName: e.accountName,
          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
        }));
      
      formData.append('entries', JSON.stringify(filteredEntries));

      // Add attachments
      newEntry.attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });

      const response = await fetch('http://localhost:3000/api/journal-entries', {
        method: 'POST',
        body: formData // Send as FormData instead of JSON
      });

      if (!response.ok) throw new Error('The system failed to create the journal entry.');

      await fetchJournalEntries();
      setShowNewEntry(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        description: '',
        isAdjustingEntry: false,
        attachments: [],
        entries: [
          { accountId: '', accountName: '', debit: '', credit: '', type: 'debit' },
          { accountId: '', accountName: '', debit: '', credit: '', type: 'credit' }
        ]
      });
    } catch (err) {
      alert('There was an error creating the journal entry: ' + err.message);
    }
  };

  // Approve entry
  const approveEntry = async (entryId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/journal-entries/${entryId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to approve journal entry');
    }

    const approvedEntry = journalEntries.find((e) => e._id === entryId);
    if (!approvedEntry) {
      throw new Error('Approved entry not found in local data.');
    }

    // Update each account's balance
    for (const line of approvedEntry.entries) {
      const { accountId, debit = 0, credit = 0 } = line;

      // Match account by account_number
      const account = chartOfAccounts.find(acc => acc.account_number === line.accountId);
      if (!account) {
        console.warn(`⚠️ Account ${accountId} not found, skipping.`);
        continue;
      }

      let newBalance = account.balance; 
      let newDebits = account.debits
      let newCredits = account.credits

      if (account.normal_side === "L") {
        newBalance += line.debit;
        newBalance -= line.credit;
      } else {
        newBalance -= line.debit;
        newBalance += line.credit;
      }

      newDebits += line.debit;
      newCredits += line.credit;

        await fetch(`http://localhost:3000/api/accounts/${account._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: newBalance,
            debits: newDebits,
            credits: newCredits,
          }),
        });
      }

      await fetchJournalEntries();
      await fetchChartOfAccounts();
      setSelectedEntry(null);
    } catch (err) {
      alert('Error approving entry: ' + err.message);
    }
  };



  // Reject entry
  const rejectEntry = async (entryId) => {
    if (!rejectionComment.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/journal-entries/${entryId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: rejectionComment })
      });

      if (!response.ok) throw new Error('Failed to reject journal entry');

      await fetchJournalEntries();
      setSelectedEntry(null);
      setRejectionComment('');
    } catch (err) {
      alert('Error rejecting entry: ' + err.message);
    }
  };

  const StatusBadge = ({ status }) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Journal Entry Manager</h1>
        </div>
        <div className="admin-section">
          <div className="loading-message">Loading journal entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <HelpButton />
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={logo} 
            alt="Sweet Ledger Logo" 
            className="header-logo"
          />
          <h1 className="admin-title">Journal Entries</h1>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowNewEntry(true)} className="btn new-entry-btn">
            <span className="btn-icon">+</span>
            New Entry
          </button>
        </div>
      </div>

      <nav className="dashboard-nav" style={{ backgroundColor: '#ebebeb75', borderBottom: '1px solid #ccc' }}>
        <div className="button-container">
          <Calendar title="Calendar" />
          <span className="tooltiptext">Click here to open the calendar</span>
        </div>
        <button
          className="nav-button"
          onClick={() => {
              if (currentUser.role === "Manager") navigate("/manager");
			  else if (currentUser.role === "Accountant") navigate("/regularaccountuser");
			}}
		  >
			🏠 Dashboard
		  </button>
		  <button
			className="nav-button"
			onClick={() => {
			  if (currentUser.role === "Manager" || currentUser.role === "Accountant") navigate("/AccountView");
			  else navigate("/accountmanagement");
			}}
		  >
			👤 Account Management
		  </button>
		  <button className="nav-button" onClick={() => navigate("/chartofaccounts")}>
			📋 Chart of Accounts
		  </button>
		  <button className="nav-button" onClick={() => navigate("/eventlog")}>
			📝 Event Log
		  </button>
		  {currentUser.role !== 'Admin' && (
			<button className="nav-button" onClick={() => navigate("/journalentries")}>
			  📖 Journalize
			</button>
		  )}
		  <button className="nav-button" onClick={() => navigate("/ledger")}>
			📙 Ledger
		  </button>
		  <button className="nav-button" onClick={() => navigate("/reports")}>
			📊 Financial Reports
		  </button>
		</nav>

      {error && (
        <div className="admin-section">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="admin-section">
        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="tab-count">
                  (
                    {tab === 'all'
                      ? journalEntries.length
                      : journalEntries.filter((e) => e.status === tab).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Entry Type Filter - NEW */}
          <div className="filter-container">
            <span className="filter-icon">📋</span>
            <label className="filter-label">
              <span>Entry Type:</span>
              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Entries</option>
                <option value="regular">Regular Entries</option>
                <option value="adjusting">Adjusting Entries</option>
              </select>
            </label>
          </div>

          {/* Search Bar */}
          <div className="filter-container">
            <span className="filter-icon">🔍</span>
            <div className="search-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by account name, amount, date, or description..."
                className="form-input search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="filter-container">
            <span className="filter-icon">📅</span>

            <label className="filter-label">
              <span>From:</span>
              <input
                type="date"
                value={dateFilter.start}
                max={dateFilter.end || undefined}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
                className="date-input"
              />
            </label>

            <label className="filter-label">
              <span>To:</span>
              <input
                type="date"
                value={dateFilter.end}
                min={dateFilter.start || undefined}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                className="date-input"
              />
            </label>

            {(dateFilter.start || dateFilter.end) && (
              <button
                onClick={() => setDateFilter({ start: '', end: '' })}
                className="clear-filter-btn"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          {(searchTerm || dateFilter.start || dateFilter.end || entryTypeFilter !== 'all') && (
            <div className="results-count">
              Showing {filteredEntries.length} of {journalEntries.filter(e => activeTab === 'all' || e.status === activeTab).length} entries
            </div>
          )}

          {/* Entries List */}
          <div className="entries-list">
            {filteredEntries.length === 0 ? (
              <div className="empty-state">
                {searchTerm || dateFilter.start || dateFilter.end || entryTypeFilter !== 'all'
                  ? 'No journal entries match your search criteria'
                  : `No ${activeTab} journal entries found`
                }
              </div>
            ) : (
              filteredEntries.map(entry => (
					<div key={entry._id} id={`entry-${entry._id}`} className={`entry-card ${highlightEntryId === entry._id ? 'highlighted' : ''}`}>
					  <div className="entry-info">
						<div className="entry-meta">
						  <span className="entry-id">JE-{entry.journalEntryNumber || entry._id.slice(-6)}</span>
						  <StatusBadge status={entry.status} />
						  {entry.isAdjustingEntry && <span className="adjusting-badge">Adjusting Entry</span>}
						  <span className="entry-date">{new Date(...entry.date.split('-').map((v,i) => i===1 ? v-1 : v)).toLocaleDateString()}</span>
						</div>
						<p className="entry-description">{entry.description}</p>
						<p className="entry-creator">Created by {entry.createdBy || 'Unknown'}</p>

						<table className="journal-table preview-table">
						  <thead>
							<tr>
							  <th>Account</th>
							  <th>Debit</th>
							  <th>Credit</th>
							</tr>
						  </thead>
						  <tbody>
							{entry.entries
							  .filter(e => e.accountId || e.debit > 0 || e.credit > 0)
							  .sort((a,b) => b.debit - a.debit)
							  .map((e, idx) => (
								<tr key={idx}>
								  <td>
									<span style={{ paddingLeft: e.credit > 0 ? 16 : 0, display: 'inline-block' }}>
									  <Link
										to={`/ledger/${e.accountId}`}
										onClick={(e) => e.stopPropagation()}
										style={{ textDecoration: "none", color: "#1976d2", cursor: "pointer", fontWeight: 500 }}
									  >
										{e.accountId}
									  </Link> - {e.accountName}
									</span>
								  </td>
								  <td className="text-right">{formatCurrency(e.debit)}</td>
								  <td className="text-right">{formatCurrency(e.credit)}</td>
								</tr>
							  ))}
						  </tbody>
						</table>

						{(() => {
						  const accounts = Array.isArray(entry.entries[0]) ? entry.entries.flat() : entry.entries;
						  const filteredAccounts = accounts.filter(e => e.accountName);
						  const totalDebit = filteredAccounts.reduce((sum, e) => sum + (e.debit || 0), 0);
						  const totalCredit = filteredAccounts.reduce((sum, e) => sum + (e.credit || 0), 0);
						  return (
							<p>
							  <strong>Total Debit:</strong> {totalDebit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | 
							  <strong>Total Credit:</strong> {totalCredit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
							</p>
						  );
						})()}

					  </div>

					  <button
						onClick={() => {
						  setSelectedEntry(entry);
						  window.history.pushState(null, '', `/journalentries/${entry._id}`);
						}}
						className="view-btn"
					  >
						👁️ View
					  </button>
					</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Create Journal Entry</h2>
              <button onClick={() => setShowNewEntry(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    className="form-input"
                    placeholder="Enter description"
                  />
                </div>
              </div>

              {/* Adjusting Entry Checkbox */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newEntry.isAdjustingEntry}
                    onChange={(e) => setNewEntry({ ...newEntry, isAdjustingEntry: e.target.checked })}
                  />
                  <span>This is an adjusting journal entry</span>
                </label>
              </div>

              {/* File Upload Section */}
              <div className="form-group">
                <label className="form-label">Attachments (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  Accepted: PDF, Word, Excel, CSV, JPG, PNG (Max 5MB each)
                </p>
                
                {/* Display uploaded files */}
                {newEntry.attachments.length > 0 && (
                  <div className="attachments-list" style={{ marginTop: '1rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                      Uploaded Files ({newEntry.attachments.length}):
                    </strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {newEntry.attachments.map((file, index) => (
                        <div 
                          key={index} 
                          className="attachment-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                            📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="remove-line-btn"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="journal-table-container">
                <table className="journal-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const selectedAccountIds = newEntry.entries.map(e => e.accountId);
                      return (
                        <>
                          {/* Debit Section */}
                          <tr>
                            <th colSpan="4" className="text-left bg-gray-100">
                              <strong>Debits</strong>
                            </th>
                          </tr>
                          {newEntry.entries
                            .map((entry, index) => ({ ...entry, realIndex: index }))
                            .filter((entry) => entry.type === 'debit')
                            .map((entry) => (
                              <tr key={`debit-${entry.realIndex}`}>
                                <td>
                                  <select
                                    value={entry.accountId}
                                    onChange={(e) => handleAccountChange(entry.realIndex, e.target.value)}
                                    className="form-select"
                                  >
                                    <option value="">Select Account</option>
                                    {chartOfAccounts
                                      .filter(
                                        (acc) =>
                                          !selectedAccountIds.includes(acc.account_number) ||
                                          acc.account_number === entry.accountId
                                      )
                                      .map((acc) => (
                                        <option key={acc._id} value={acc.account_number}>
                                          {acc.account_number} - {acc.account_name}
                                        </option>
                                      ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={entry.debit || ''}
                                    onChange={(e) =>
                                      handleAmountChange(entry.realIndex, 'debit', e.target.value)
                                    }
                                    className="form-input text-right"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </td>
                                <td></td>
                                <td>
                                  {newEntry.entries.filter((e) => e.type === 'debit').length > 1 && (
                                    <button
                                      onClick={() => removeLine(entry.realIndex)}
                                      className="remove-line-btn"
                                    >
                                      ×
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}

                          <tr>
                            <td colSpan="4">
                              <button onClick={() => addLine('debit')} className="add-line-btn">
                                + Add Debit Line
                              </button>
                            </td>
                          </tr>

                          {/* Credit Section */}
                          <tr>
                            <th colSpan="4" className="text-left bg-gray-100">
                              <strong>Credits</strong>
                            </th>
                          </tr>

                          {newEntry.entries
                            .map((entry, index) => ({ ...entry, realIndex: index }))
                            .filter((entry) => entry.type === 'credit')
                            .map((entry) => (
                              <tr key={`credit-${entry.realIndex}`}>
                                <td>
                                  <select
                                    value={entry.accountId}
                                    onChange={(e) => handleAccountChange(entry.realIndex, e.target.value)}
                                    className="form-select"
                                  >
                                    <option value="">Select Account</option>
                                    {chartOfAccounts
                                      .filter(
                                        (acc) =>
                                          !selectedAccountIds.includes(acc.account_number) ||
                                          acc.account_number === entry.accountId
                                      )
                                      .map((acc) => (
                                        <option key={acc._id} value={acc.account_number}>
                                          {acc.account_number} - {acc.account_name}
                                        </option>
                                      ))}
                                  </select>
                                </td>
                                <td></td>
                                <td>
                                  <input
                                    type="number"
                                    value={entry.credit || ''}
                                    onChange={(e) =>
                                      handleAmountChange(entry.realIndex, 'credit', e.target.value)
                                    }
                                    className="form-input text-right"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </td>
                                <td>
                                  {newEntry.entries.filter((e) => e.type === 'credit').length > 1 && (
                                    <button
                                      onClick={() => removeLine(entry.realIndex)}
                                      className="remove-line-btn"
                                    >
                                      ×
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}

                          <tr>
                            <td colSpan="4">
                              <button onClick={() => addLine('credit')} className="add-line-btn">
                                + Add Credit Line
                              </button>
                            </td>
                          </tr>
                        </>
                      );
                    })()}   
                  </tbody>
                </table>
              </div>
              {!totals.balanced && totals.debit > 0 && (
                <div className="error-message">
                  Entry is not balanced. Debits: ${totals.debit.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) ?? '0.00'}, Credits: ${totals.credit.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) ?? '0.00'}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowNewEntry(false)} className="btn cancel">
                Cancel
              </button>
              <button
                onClick={submitEntry}
                disabled={!totals.balanced}
                className="btn"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <div>
                <h2>Journal Entry JE-{selectedEntry.journalEntryNumber || selectedEntry._id.slice(-6)}</h2>
                <StatusBadge status={selectedEntry.status} />
                {selectedEntry.isAdjustingEntry && (
                  <span className="adjusting-badge" style={{ marginLeft: '0.5rem' }}>Adjusting Entry</span>
                )}
              </div>
              <button onClick={() => { setSelectedEntry(null); setRejectionComment(''); window.history.pushState(null, '', '/journalentries'); }} className="close-btn">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <p className="detail-value">{new Date(...selectedEntry.date.split('-').map((v,i) => i === 1 ? v-1 : v)).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created By:</span>
                  <p className="detail-value">{selectedEntry.createdBy || 'Unknown'}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <p className="detail-value">{selectedEntry.description}</p>
              </div>

              {/* Display Attachments */}
              {selectedEntry.attachments && selectedEntry.attachments.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Attachments:</span>
                  <div style={{ marginTop: '0.5rem' }}>
                    {selectedEntry.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={`http://localhost:3000/uploads/${attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          padding: '0.5rem',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          color: '#f7941d',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fff8f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      >
                        📎 {attachment}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <table className="journal-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEntry.entries
                          .filter(e => e.accountId || e.debit > 0 || e.credit > 0)
                          .sort((a,b) => b.debit - a.debit) // debits first
                          .map((e, idx) => (
                            <tr key={idx}>
                              <td>
                                <span style={{ paddingLeft: e.credit > 0 ? 16 : 0, display: 'inline-block' }}>
                                  <Link
                                      to={`/ledger/${e.accountId}`}
                                      onClick={(e) => e.stopPropagation()} // prevents table clicks from blocking navigation
                                      style={{
                                        textDecoration: "none",
                                        color: "#1976d2",
                                        cursor: "pointer",
                                        fontWeight: 500,
                                      }}
                                    > {e.accountId} </Link> - {e.accountName}
                                  </span>
                              </td>
                              <td className="text-right">{formatCurrency(e.debit)}</td>
                              <td className="text-right">{formatCurrency(e.credit)}</td>
                            </tr>
                          ))}
                </tbody>
              </table>

              {selectedEntry.status === 'rejected' && selectedEntry.comment && (
                <div className="error-message">
                  <strong>💬 Rejection Reason:</strong>
                  <p>{selectedEntry.comment}</p>
                </div>
              )}

              {selectedEntry.status === 'pending' && (
                <div className="approval-section">
                  <label className="form-label">
                    Rejection Comment (required if rejecting):
                  </label>
                  <textarea
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              {selectedEntry.status !== 'pending' && selectedEntry.reviewedAt && (
                <div className="review-info">
                  Reviewed by {selectedEntry.reviewedBy || 'Unknown'} on {new Date(selectedEntry.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>

            {selectedEntry.status === 'pending' && currentUser?.role === "Manager" && (
              <div className="modal-footer">
                <button
                  onClick={() => rejectEntry(selectedEntry._id)}
                  className="btn reject-btn"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() => approveEntry(selectedEntry._id)}
                  className="btn approve-btn"
                >
                  ✓ Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;