const express = require('express');
const router = express.Router();
const { getDB } = require('../db'); 

// GET all accounts (Chart of Accounts)
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    // Fetch all accounts from MongoDB (collection name = chartofaccounts)
    const accounts = await db.collection('chartofaccounts').find({}).toArray();

    res.json(accounts);
  } catch (err) {
    console.error('Error fetching chart of accounts:', err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

module.exports = router;
