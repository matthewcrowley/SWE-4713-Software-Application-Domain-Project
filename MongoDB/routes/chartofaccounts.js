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
    // Extract current user BEFORE filtering
    const currentUser = q.body.currentUser || 'Unknown User';

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

    // BEFORE version
    const beforeAccount = await db
      .collection('chart_of_accounts')
      .findOne({ _id: new ObjectId(id) });

    if (!beforeAccount) {
      return s.status(404).json({ message: `Account ${id} not found.` });
    }

    // Update account
    await db.collection('chart_of_accounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: sanitizedData }
    );

    // AFTER version
    const updatedAccount = await db
      .collection('chart_of_accounts')
      .findOne({ _id: new ObjectId(id) });

    // INSERT EVENT LOG
    await db.collection('eventlogs').insertOne({
      action: `Account Updated`,
      targetType: 'accountUpdated',
      targetId: id,
      before: beforeAccount,
      after: updatedAccount,
      user: currentUser,
      timestamp: new Date()
    });

    // Return updated account
    s.status(200).json(updatedAccount);

  } catch (error) {
    console.error('Error updating account:', error);
    s.status(500).json({ error: 'Failed to update account' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();

    // Extract current user if provided
    const currentUser = req.body.currentUser || 'Unknown User';

    // Allowed fields for creating an account
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

    // Sanitize input
    const sanitizedData = Object.keys(req.body)
      .filter(k => allowedFields.includes(k))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Add automatic fields
    sanitizedData.timestamp = new Date();

    // Insert into chart of accounts
    const result = await db.collection('chart_of_accounts').insertOne(sanitizedData);

    const newAccount = await db
      .collection('chart_of_accounts')
      .findOne({ _id: result.insertedId });

    // Log event
    await db.collection('eventlogs').insertOne({
      action: 'Account Created',
      targetType: 'accountCreated',
      targetId: result.insertedId.toString(),
      before: null,
      after: newAccount,
      user: sanitizedData.created_by,
      timestamp: new Date()
    });

    res.status(201).json(newAccount);

  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

module.exports = router;