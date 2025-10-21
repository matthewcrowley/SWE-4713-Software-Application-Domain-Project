const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.collection('chart_of_accounts')
      .find({})
      .sort({accountNumber: 1})
      .toArray();
    
    res.status(200).json(accounts);
  } catch (err) {
    console.error('Error fetching accounts:', err);
    res.status(500).json({error: 'Failed to fetch accounts'});
  }
});

module.exports = router;