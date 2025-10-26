const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

router.get('/', async (q, s) => {
  try {
    const db = getDB();
    const accounts = await db.collection('chart_of_accounts')
      .find({})
      .sort({account_number: 1})
      .toArray();

    s.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    s.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.put('/:id', async (q, s) => {
  try {
    const db = getDB();
    const {id} = q.params;
    const updateData = {...q.body};

    delete updateData._id;

    const allowedFields = [
      'account_number',
      'account_name',
      'type',
      'description',
      'debits',
      'credits',
      'balance',
      'subcategory',
      'created_by',
      'timestamp',
      'comments'
    ];

    const sanitizedData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((object, key) => {
        object[key] = updateData[key];
        return object;
      }, {});

    const result = await db.collection('chart_of_accounts').updateOne(
      {_id: new ObjectId(id)},
      {$set: sanitizedData}
    );

    if (result.matchedCount === 0) {
      return s.status(404).json({message: `Account ${id} not found.`});
    }

    const updatedAccount = await db.collection('chart_of_accounts').findOne({_id: new ObjectId(id)});

    s.status(200).json(updatedAccount);

  } catch (error) {
    console.error('Error updating account:', error);
    s.status(500).json({ error: 'Failed to update account' });
  }
});

module.exports = router;