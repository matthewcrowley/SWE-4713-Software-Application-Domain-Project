const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// GET ledger entries for an account
router.get('/:accountId', async (req, res) => {
  try {
    const db = getDB();
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;

    console.log('📡 Fetching ledger for accountId:', accountId);

    //Base query
    const query = { accountId: accountId.toString() };

    //Apply date filters if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    //Fetch ledger entries for this account
    const ledgerEntries = await db
      .collection('ledger')
      .find(query)
      .sort({ date: 1 })
      .toArray();

    console.log(`Found ${ledgerEntries.length} entries for account ${accountId}`);

    //Fetch account info (optional)
    const account = await db.collection('accounts').findOne({ accountNumber: accountId.toString() })
      || { accountNumber: accountId, accountName: 'Unknown Account' };

    //Calculate running balance
    let runningBalance = account.initialBalance || 0;
    const normalSide = account.normalSide?.toLowerCase() || 'debit';

    const entriesWithBalance = ledgerEntries.map(entry => {
      if (normalSide === 'debit') {
        runningBalance += (entry.debit || 0) - (entry.credit || 0);
      } else {
        runningBalance += (entry.credit || 0) - (entry.debit || 0);
      }
      
      // ADD JOURNALID HERE - This enables clickable post references
      return { 
        ...entry, 
        balance: runningBalance,
        journalId: entry.journalEntryId || entry.journalId // ← Add this line
      };
    });

    //Return structured data
    res.json({
      account,
      entries: entriesWithBalance,
    });

  } catch (err) {
    console.error('Error fetching ledger entries:', err);
    res.status(500).json({ message: 'Failed to fetch ledger entries', error: err.message });
  }
});

// GET all ledger entries (for reporting)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate } = req.query;

    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await db.collection('ledger')
      .find(query)
      .sort({ date: 1, accountId: 1, postedAt: 1 })
      .toArray();

    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching all ledger entries:', error);
    res.status(500).json({ error: 'Failed to fetch ledger entries' });
  }
});

// GET trial balance (for financial statements)
router.get('/reports/trial-balance', async (req, res) => {
  try {
    const db = getDB();
    const { asOfDate } = req.query;
    
    let dateQuery = {};
    if (asOfDate) {
      dateQuery = { date: { $lte: new Date(asOfDate) } };
    }

    // Get all accounts with their current balances
    const accounts = await db.collection('accounts')
      .find({ account_status: 'Active' })
      .sort({ account_number: 1 })
      .toArray();

    // Calculate balances based on ledger entries up to the date
    const trialBalance = [];
    
    for (const account of accounts) {
      const ledgerEntries = await db.collection('ledger')
        .find({ 
          accountId: account.account_number,
          ...dateQuery
        })
        .toArray();

      let balance = account.initial_balance || 0;
      let totalDebits = 0;
      let totalCredits = 0;

      for (const entry of ledgerEntries) {
        totalDebits += entry.debit || 0;
        totalCredits += entry.credit || 0;
        
        if (account.normal_side === 'L') {
          balance += (entry.debit || 0) - (entry.credit || 0);
        } else {
          balance += (entry.credit || 0) - (entry.debit || 0);
        }
      }

      trialBalance.push({
        accountNumber: account.account_number,
        accountName: account.account_name,
        accountCategory: account.account_category,
        normalSide: account.normal_side,
        debit: account.normal_side === 'L' && balance > 0 ? balance : 0,
        credit: account.normal_side === 'R' && balance > 0 ? balance : 0,
        totalDebits,
        totalCredits
      });
    }

    const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

    res.status(200).json({
      asOfDate: asOfDate || new Date(),
      accounts: trialBalance,
      totals: {
        debit: totalDebit,
        credit: totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01
      }
    });
  } catch (error) {
    console.error('Error generating trial balance:', error);
    res.status(500).json({ error: 'Failed to generate trial balance' });
  }
});

module.exports = router;