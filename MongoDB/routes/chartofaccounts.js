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

// Update an account in the Chart of Accounts
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params; // URL param (string)
    const updateData = { ...req.body };

    // Prevent updating _id
    delete updateData._id;

    // Whitelist fields allowed to update
    const allowedFields = [
      'account_number',
      'account_name',
      'type',
      'description',
      'debits',
      'credits',
      'balance',
      'subcategory',
    ];

    const sanitizedData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const result = await db.collection('chart_of_accounts').updateOne(
      { _id: new ObjectId(id) }, // Convert string ID to ObjectId
      { $set: sanitizedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `Account ${id} not found.` });
    }

    res.status(200).json({ message: `Account ${id} updated successfully.` });
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

module.exports = router;