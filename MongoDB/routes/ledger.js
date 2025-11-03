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
    const account = await db.collection('chart_of_accounts').findOne({ account_number: accountId.toString() })
      || { account_number: accountId, accountName: 'Unknown Account' };

    //Calculate running balance
    let runningBalance = account.initialBalance || 0;
    const normalSide = account.normalSide?.toLowerCase() || 'debit';

    const entriesWithBalance = ledgerEntries.map(entry => {
      if (normalSide === 'debit') {
        runningBalance += (entry.debit || 0) - (entry.credit || 0);
      } else {
        runningBalance += (entry.credit || 0) - (entry.debit || 0);
      }
      return { ...entry, balance: runningBalance };
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

module.exports = router;