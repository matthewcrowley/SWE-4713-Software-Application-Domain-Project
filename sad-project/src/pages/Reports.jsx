import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, Box,
  Typography, Divider
} from '@mui/material';
import logo from "../assets/sweetledger.jpeg";
import HelpButton from '../components/HelpButton';
import Calendar from '../components/Calendar';
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();

  // ===== State Variables =====
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report Configuration
  const [reportType, setReportType] = useState('trialBalance');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedReport, setGeneratedReport] = useState(null);

  // Email State
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [emailMessage, setEmailMessage] = useState('');

  // ===== Fetch Current User =====
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/curUser");
        const data = await response.json();
        setCurrentUser(data.currentUser || null);
      } catch (err) {
        console.warn("Could not fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // ===== Fetch Accounts and Journal Entries =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [accountsRes, journalRes] = await Promise.all([
          fetch('http://localhost:3000/api/accounts'),
          fetch('http://localhost:3000/api/journal-entries')
        ]);

        if (!accountsRes.ok || !journalRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const accountsData = await accountsRes.json();
        const journalData = await journalRes.json();

        setAccounts(accountsData);
        setJournalEntries(journalData.filter(entry => entry.status === 'approved'));
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load financial data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== Report Generation Functions =====
  const generateTrialBalance = () => {
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.date) <= new Date(reportDate)
    );

    const accountBalances = {};
    
    // Initialize all accounts
    accounts.forEach(account => {
      accountBalances[account.account_number] = {
        accountName: account.account_name,
        accountNumber: account.account_number,
        normalSide: account.normal_side,
        category: account.type,
        debit: 0,
        credit: 0,
        balance: parseFloat(account.balance) || 0
      };
    });

    // Calculate balances from journal entries
    filteredEntries.forEach(entry => {
      entry.entries.forEach(line => {
        if (accountBalances[line.accountId]) {
          accountBalances[line.accountId].debit += parseFloat(line.debit) || 0;
          accountBalances[line.accountId].credit += parseFloat(line.credit) || 0;
        }
      });
    });

    // Calculate final debit/credit columns for trial balance
    const trialBalanceData = Object.values(accountBalances)
      .filter(acc => acc.debit > 0 || acc.credit > 0 || acc.balance !== 0)
      .map(acc => ({
        ...acc,
        trialBalanceDebit: acc.normalSide === 'L' ? acc.balance : 0,
        trialBalanceCredit: acc.normalSide === 'R' ? Math.abs(acc.balance) : 0
      }))
      .sort((a, b) => a.accountNumber - b.accountNumber);

    const totalDebit = trialBalanceData.reduce((sum, acc) => sum + acc.trialBalanceDebit, 0);
    const totalCredit = trialBalanceData.reduce((sum, acc) => sum + acc.trialBalanceCredit, 0);

    return {
      type: 'Trial Balance',
      date: reportDate,
      data: trialBalanceData,
      totals: { debit: totalDebit, credit: totalCredit },
      balanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
  };

  const generateIncomeStatement = () => {
    const start = startDate || '1900-01-01';
    const end = endDate;

    const filteredEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(start) && entryDate <= new Date(end);
    });

    const revenues = [];
    const expenses = [];

    accounts.forEach(account => {
      if (account.type === 'Revenue' || account.type === 'Income') {
        const accountEntries = filteredEntries.flatMap(entry =>
          entry.entries.filter(line => line.accountId === account.account_number)
        );
        
        const credits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
        const debits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
        const balance = credits - debits;

        if (balance !== 0) {
          revenues.push({
            accountNumber: account.account_number,
            accountName: account.account_name,
            amount: balance
          });
        }
      } else if (account.type === 'Expense') {
        const accountEntries = filteredEntries.flatMap(entry =>
          entry.entries.filter(line => line.accountId === account.account_number)
        );
        
        const debits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
        const credits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
        const balance = debits - credits;

        if (balance !== 0) {
          expenses.push({
            accountNumber: account.account_number,
            accountName: account.account_name,
            amount: balance
          });
        }
      }
    });

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      type: 'Income Statement',
      startDate: start,
      endDate: end,
      revenues,
      expenses,
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome
      }
    };
  };

  const generateBalanceSheet = () => {
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.date) <= new Date(reportDate)
    );

    const assets = [];
    const liabilities = [];
    const equity = [];

    accounts.forEach(account => {
      const accountEntries = filteredEntries.flatMap(entry =>
        entry.entries.filter(line => line.accountId === account.account_number)
      );

      const debits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
      const credits = accountEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
      
      let balance;
      if (account.normal_side === 'L') {
        balance = debits - credits;
      } else {
        balance = credits - debits;
      }

      if (balance !== 0 || parseFloat(account.balance) !== 0) {
        const finalBalance = account.balance

        if (account.type === 'Asset') {
          assets.push({
            accountNumber: account.account_number,
            accountName: account.account_name,
            subcategory: account.subcategory,
            amount: finalBalance
          });
        } else if (account.type === 'Liability') {
          liabilities.push({
            accountNumber: account.account_number,
            accountName: account.account_name,
            subcategory: account.subcategory,
            amount: finalBalance
          });
        } else if (account.type === 'Equity') {
          equity.push({
            accountNumber: account.account_number,
            accountName: account.account_name,
            subcategory: account.subcategory,
            amount: finalBalance
          });
        }
      }
    });

     // Add retained earnings to equity section
    const retainedEarningsReport = generateRetainedEarnings();
    const retainedEarningsAmount = retainedEarningsReport.endingRE || 0;

    equity.push({
      accountNumber: 'RE',
      accountName: 'Retained Earnings',
      subcategory: 'Equity',
      amount: retainedEarningsAmount
    });

    var totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    // ✅ Subtract twice the accumulated depreciation amount from total assets
    const accumulatedDepAccount = assets.find(a => 
      a.accountName.toLowerCase().includes('accumulated depreciation')
    );

    if (accumulatedDepAccount) {
      totalAssets -= 2 * Math.abs(accumulatedDepAccount.amount);
    }

    return {
      type: 'Balance Sheet',
      date: reportDate,
      assets,
      liabilities,
      equity,
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        liabilitiesAndEquity: totalLiabilities + totalEquity
      }
    };
  };

  const generateRetainedEarnings = () => {
    const start = startDate || '1900-01-01';
    const end = endDate;

    // Get beginning retained earnings (from equity accounts)
    const retainedEarningsAccount = accounts.find(
      acc => acc.account_name.toLowerCase().includes('retained earnings')
    );
    
    const beginningRE = retainedEarningsAccount ? parseFloat(retainedEarningsAccount.balance) || 0 : 0;

    // Calculate net income for the period
    const incomeStatement = generateIncomeStatement();
    const netIncome = incomeStatement.totals.netIncome;

    // Calculate dividends (if any)
    const dividendsAccount = accounts.find(
      acc => acc.account_name.toLowerCase().includes('dividend')
    );
    
    const filteredEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(start) && entryDate <= new Date(end);
    });

    let dividends = 0;
    if (dividendsAccount) {
      const dividendEntries = filteredEntries.flatMap(entry =>
        entry.entries.filter(line => line.accountId === dividendsAccount.account_number)
      );
      dividends = dividendEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    }

    const endingRE = beginningRE + netIncome - dividends;

    return {
      type: 'Statement of Retained Earnings',
      startDate: start,
      endDate: end,
      beginningRE,
      netIncome,
      dividends,
      endingRE
    };
  };

  // ===== Handle Generate Report =====
  const handleGenerateReport = () => {
    setError('');
    
    if ((reportType === 'incomeStatement' || reportType === 'retainedEarnings') && !startDate) {
      setError('Please select a start date for this report type');
      return;
    }

    let report;
    switch (reportType) {
      case 'trialBalance':
        report = generateTrialBalance();
        break;
      case 'incomeStatement':
        report = generateIncomeStatement();
        break;
      case 'balanceSheet':
        report = generateBalanceSheet();
        break;
      case 'retainedEarnings':
        report = generateRetainedEarnings();
        break;
      default:
        setError('Invalid report type');
        return;
    }

    setGeneratedReport(report);
  };

  // ===== Print Report =====
  const handlePrint = () => {
    window.print();
  };

  // ===== Email Report =====
  const handleSendEmail = async () => {
    if (!emailForm.email || !emailForm.subject) {
      setEmailMessage('Please fill in all required fields');
      return;
    }

    try {
      const reportHTML = document.getElementById('report-content').innerHTML;
      
      const response = await fetch('http://localhost:3000/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailForm.email,
          subject: emailForm.subject,
          message: emailForm.message + '\n\n' + reportHTML
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailMessage('Email sent successfully!');
        setTimeout(() => {
          setShowEmailDialog(false);
          setEmailForm({ email: '', subject: '', message: '' });
          setEmailMessage('');
        }, 2000);
      } else {
        setEmailMessage('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailMessage('Server error while sending email');
    }
  };

  // ===== Save Report =====
  const handleSaveReport = () => {
    const reportContent = document.getElementById('report-content').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.type.replace(/\s+/g, '_')}_${reportDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ===== Render Report =====
  const renderReport = () => {
    if (!generatedReport) return null;

    return (
      <div id="report-content" className="report-content">
        <div className="report-header">
          <Typography variant="h4" align="center" gutterBottom>
            SweetLedger Inc.
          </Typography>
          <Typography variant="h5" align="center" gutterBottom>
            {generatedReport.type}
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            {generatedReport.startDate && generatedReport.endDate
              ? `For the Period: ${new Date(generatedReport.startDate).toLocaleDateString()} - ${new Date(generatedReport.endDate).toLocaleDateString()}`
              : `As of ${new Date(generatedReport.date).toLocaleDateString()}`}
          </Typography>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* Trial Balance */}
        {reportType === 'trialBalance' && (
          <Table className="report-table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Account Number</strong></TableCell>
                <TableCell><strong>Account Name</strong></TableCell>
                <TableCell align="right"><strong>Debit</strong></TableCell>
                <TableCell align="right"><strong>Credit</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {generatedReport.data.map((acc) => (
                <TableRow key={acc.accountNumber}>
                  <TableCell>{acc.accountNumber}</TableCell>
                  <TableCell>{acc.accountName}</TableCell>
                  <TableCell align="right">
                    {acc.trialBalanceDebit > 0 
                      ? `$${acc.trialBalanceDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {acc.trialBalanceCredit > 0 
                      ? `$${acc.trialBalanceCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total-row">
                <TableCell colSpan={2}><strong>Total</strong></TableCell>
                <TableCell align="right">
                  <strong>${generatedReport.totals.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>${generatedReport.totals.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {/* Income Statement */}
        {reportType === 'incomeStatement' && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              <strong>Revenues</strong>
            </Typography>
            <Table className="report-table">
              <TableBody>
                {generatedReport.revenues.map((rev) => (
                  <TableRow key={rev.accountNumber}>
                    <TableCell>{rev.accountName}</TableCell>
                    <TableCell align="right">
                      ${rev.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="subtotal-row">
                  <TableCell><strong>Total Revenue</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              <strong>Expenses</strong>
            </Typography>
            <Table className="report-table">
              <TableBody>
                {generatedReport.expenses.map((exp) => (
                  <TableRow key={exp.accountNumber}>
                    <TableCell>{exp.accountName}</TableCell>
                    <TableCell align="right">
                      ${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="subtotal-row">
                  <TableCell><strong>Total Expenses</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table className="report-table" sx={{ mt: 2 }}>
              <TableBody>
                <TableRow className="total-row">
                  <TableCell><strong>Net Income</strong></TableCell>
                  <TableCell align="right">
                    <strong className={generatedReport.totals.netIncome < 0 ? 'negative-amount' : 'positive-amount'}>
                      ${Math.abs(generatedReport.totals.netIncome).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {generatedReport.totals.netIncome < 0 && ' (Loss)'}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Balance Sheet */}
        {reportType === 'balanceSheet' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              <strong>Assets</strong>
            </Typography>
            <Table className="report-table">
              <TableBody>
                {generatedReport.assets.map((asset) => (
                  <TableRow key={asset.accountNumber}>
                    <TableCell>{asset.accountName}</TableCell>
                    <TableCell align="right">
                      ${asset.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="subtotal-row">
                  <TableCell><strong>Total Assets</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.assets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              <strong>Liabilities</strong>
            </Typography>
            <Table className="report-table">
              <TableBody>
                {generatedReport.liabilities.map((liability) => (
                  <TableRow key={liability.accountNumber}>
                    <TableCell>{liability.accountName}</TableCell>
                    <TableCell align="right">
                      ${liability.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="subtotal-row">
                  <TableCell><strong>Total Liabilities</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.liabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              <strong>Equity</strong>
            </Typography>
            <Table className="report-table">
              <TableBody>
                {generatedReport.equity.map((eq) => (
                  <TableRow key={eq.accountNumber}>
                    <TableCell>{eq.accountName}</TableCell>
                    <TableCell align="right">
                      ${eq.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="subtotal-row">
                  <TableCell><strong>Total Equity</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table className="report-table" sx={{ mt: 2 }}>
              <TableBody>
                <TableRow className="total-row">
                  <TableCell><strong>Total Liabilities and Equity</strong></TableCell>
                  <TableCell align="right">
                    <strong>${generatedReport.totals.liabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Retained Earnings Statement */}
        {reportType === 'retainedEarnings' && (
          <Table className="report-table">
            <TableBody>
              <TableRow>
                <TableCell>Beginning Retained Earnings</TableCell>
                <TableCell align="right">
                  ${generatedReport.beginningRE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Add: Net Income</TableCell>
                <TableCell align="right">
                  ${generatedReport.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Less: Dividends</TableCell>
                <TableCell align="right">
                  ${generatedReport.dividends.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
              <TableRow className="total-row">
                <TableCell><strong>Ending Retained Earnings</strong></TableCell>
                <TableCell align="right">
                  <strong>${generatedReport.endingRE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>Financial Reports</h1>
        </div>
        <div className="loading-message">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <HelpButton />
      
      {/* Header */}
      <header className="reports-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="Sweet Ledger Logo" className="header-logo" />
          <h1 className="reports-title">Financial Reports</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="button-container">
          <Calendar title="Calendar" />
          <span className="tooltiptext">Click here to open the calendar</span>
        </div>
        <button className="nav-button"
          onClick={() => {
            if (currentUser?.role === "Manager") navigate("/manager");
            else if (currentUser?.role === "Accountant") navigate("/regularaccountuser");
            else navigate("/administrator");
          }}>
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

      {error && <div className="error-message">{error}</div>}

      {/* Report Configuration Section */}
      <Paper className="config-section" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Configuration
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => {
                setReportType(e.target.value);
                // When switching to a new report set generated report as null
                setGeneratedReport(null);
              }}
            >
              <MenuItem value="trialBalance">Trial Balance</MenuItem>
              <MenuItem value="incomeStatement">Income Statement</MenuItem>
              <MenuItem value="balanceSheet">Balance Sheet</MenuItem>
              <MenuItem value="retainedEarnings">Statement of Retained Earnings</MenuItem>
            </Select>
          </FormControl>

          {(reportType === 'incomeStatement' || reportType === 'retainedEarnings') && (
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          )}

          <TextField
            label={reportType === 'incomeStatement' || reportType === 'retainedEarnings' ? 'End Date' : 'Report Date'}
            type="date"
            value={reportType === 'incomeStatement' || reportType === 'retainedEarnings' ? endDate : reportDate}
            onChange={(e) => {
              if (reportType === 'incomeStatement' || reportType === 'retainedEarnings') {
                setEndDate(e.target.value);
              } else {
                setReportDate(e.target.value);
              }
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          <Button
            variant="contained"
            onClick={handleGenerateReport}
            sx={{ height: 56 }}
          >
            Generate Report
          </Button>
        </Box>
      </Paper>

      {/* Generated Report Section */}
      {generatedReport && (
        <Paper className="report-section" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2, className: 'no-print' }}>
            <Button variant="outlined" onClick={handlePrint}>
              🖨️ Print
            </Button>
            <Button variant="outlined" onClick={() => setShowEmailDialog(true)}>
              📧 Email
            </Button>
            <Button variant="outlined" onClick={handleSaveReport}>
              💾 Save
            </Button>
          </Box>

          {renderReport()}
        </Paper>
      )}

      {/* Email Dialog */}
      {showEmailDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              p: 3,
              borderRadius: 2,
              boxShadow: 6,
              width: 500,
              maxWidth: '90%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Email Report
            </Typography>

            <TextField
              label="Recipient Email *"
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Subject *"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Message"
              value={emailForm.message}
              onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />

            {emailMessage && (
              <Typography
                variant="body2"
                color={emailMessage.includes('success') ? 'success.main' : 'error.main'}
                sx={{ mt: 1 }}
              >
                {emailMessage}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowEmailDialog(false);
                  setEmailMessage('');
                  setEmailForm({ email: '', subject: '', message: '' });
                }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSendEmail}>
                Send Email
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Reports;