const express = require('express');
const router = express.Router();
const JournalEntry = require('../routes/journalentries'); // Adjust path as needed
const Account = require('../routes/chartofaccounts'); // Adjust path as needed
const { getDB } = require('../db');


/**
 * GET /api/ledger/:accountId
 * Get ledger entries for a specific account
 * Returns all posted journal entries that affect this account with running balance
 */
router.get('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;

    // Fetch the account details
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Build query for journal entries
    let query = {
      status: { $in: ['Approved', 'Posted'] } // Only get approved/posted entries
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch all approved/posted journal entries
    const journalEntries = await JournalEntry.find(query).sort({ date: 1, createdAt: 1 });

    // Process entries to extract those affecting this account
    const ledgerEntries = [];

    journalEntries.forEach(journal => {
      // Check debits
      if (journal.debits && Array.isArray(journal.debits)) {
        journal.debits.forEach(debit => {
          const debitAccountId = debit.accountId || debit.account;
          if (debitAccountId && debitAccountId.toString() === accountId) {
            ledgerEntries.push({
              _id: journal._id,
              date: journal.date,
              postReference: journal.postReference || journal._id.toString().slice(-6),
              description: debit.description || journal.description || '',
              debit: parseFloat(debit.amount) || 0,
              credit: 0,
              journalId: journal._id,
              type: 'debit',
              journalStatus: journal.status
            });
          }
        });
      }

      // Check credits
      if (journal.credits && Array.isArray(journal.credits)) {
        journal.credits.forEach(credit => {
          const creditAccountId = credit.accountId || credit.account;
          if (creditAccountId && creditAccountId.toString() === accountId) {
            ledgerEntries.push({
              _id: journal._id,
              date: journal.date,
              postReference: journal.postReference || journal._id.toString().slice(-6),
              description: credit.description || journal.description || '',
              debit: 0,
              credit: parseFloat(credit.amount) || 0,
              journalId: journal._id,
              type: 'credit',
              journalStatus: journal.status
            });
          }
        });
      }
    });

    // Sort by date (oldest first)
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = account.initialBalance || 0;
    const normalSide = account.normalSide || 'Debit';

    ledgerEntries.forEach(entry => {
      if (normalSide === 'Debit') {
        runningBalance = runningBalance + entry.debit - entry.credit;
      } else {
        runningBalance = runningBalance + entry.credit - entry.debit;
      }
      entry.balance = runningBalance;
    });

    // Calculate summary totals
    const totalDebits = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredits = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const endingBalance = ledgerEntries.length > 0 
      ? ledgerEntries[ledgerEntries.length - 1].balance 
      : account.initialBalance || 0;

    res.json({
      account: {
        _id: account._id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        normalSide: account.normalSide,
        accountCategory: account.accountCategory,
        accountSubcategory: account.accountSubcategory,
        initialBalance: account.initialBalance || 0,
        balance: account.balance || 0,
        isActive: account.isActive
      },
      entries: ledgerEntries,
      summary: {
        totalDebits,
        totalCredits,
        endingBalance,
        entriesCount: ledgerEntries.length
      }
    });

  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ledger entries',
      details: error.message 
    });
  }
});

/**
 * GET /api/ledger/:accountId/summary
 * Get summary statistics for an account's ledger
 */
router.get('/:accountId/summary', async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get count of journal entries affecting this account
    const journalEntries = await JournalEntry.find({
      status: { $in: ['Approved', 'Posted'] },
      $or: [
        { 'debits.accountId': accountId },
        { 'debits.account': accountId },
        { 'credits.accountId': accountId },
        { 'credits.account': accountId }
      ]
    });

    let totalDebits = 0;
    let totalCredits = 0;
    let entriesCount = 0;

    journalEntries.forEach(journal => {
      journal.debits?.forEach(debit => {
        const debitAccountId = debit.accountId || debit.account;
        if (debitAccountId && debitAccountId.toString() === accountId) {
          totalDebits += parseFloat(debit.amount) || 0;
          entriesCount++;
        }
      });

      journal.credits?.forEach(credit => {
        const creditAccountId = credit.accountId || credit.account;
        if (creditAccountId && creditAccountId.toString() === accountId) {
          totalCredits += parseFloat(credit.amount) || 0;
          entriesCount++;
        }
      });
    });

    res.json({
      accountId: account._id,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      initialBalance: account.initialBalance || 0,
      currentBalance: account.balance || 0,
      totalDebits,
      totalCredits,
      entriesCount,
      normalSide: account.normalSide
    });

  } catch (error) {
    console.error('Error fetching ledger summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ledger summary',
      details: error.message 
    });
  }
});

module.exports = router;