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

router.put('/', async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body; // account ID must be in request body

    if (!_id) return res.status(400).json({ error: 'Account ID (_id) is required' });

    const result = await db.collection('chart_of_accounts').findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.status(200).json(result.value);
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

module.exports = router;