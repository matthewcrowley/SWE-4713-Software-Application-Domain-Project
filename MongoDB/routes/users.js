const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');

dbRoute.post('/', async (q, r) => {
  try {
    const db = getDB();
    const databaseResults = await db.collection('users').insertOne(q.body);
    r.status(201).json({ id: databaseResults.insertedId });
  } catch (err) {
    r.status(500).json({ error: err.message });
  }
});

dbRoute.get('/', async (q, r) => {
  try {
    const db = getDB();
    const sweetledgerUsers = await db.collection('users').find().toArray();
    r.json(sweetledgerUsers);
  } catch (err) {
    r.status(500).json({ error: err.message });
  }
});

// ===== Update a user (e.g., suspend account, change password, role, etc.) =====
dbRoute.put('/:username', async (req, res) => {
  try {
    const db = getDB();
    const { username } = req.params;
    const updateData = req.body;

    // Prevent updating the username field itself
    if (updateData.username) {
      delete updateData.username;
    }

    const result = await db.collection('users').updateOne(
      { username: username },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `User '${username}' not found.` });
    }

    res.status(200).json({ message: `User '${username}' updated successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

dbRoute.get('/expired-passwords', async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    const now = new Date();
    const THIRTY_DAYS_AGO = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const expiredUsers = await usersCollection
      .find({ passwordUpdatedAt: { $lt: THIRTY_DAYS_AGO } })
      .project({ username: 1, email: 1 })
      .toArray();

    res.json({ success: true, users: expiredUsers });
  } catch (err) {
    console.error('Error fetching expired passwords:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = dbRoute;