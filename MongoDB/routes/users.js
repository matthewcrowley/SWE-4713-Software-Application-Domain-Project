const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Create a new user
dbRoute.post('/', async (q, r) => {
  try {
    const db = getDB();
    const databaseResults = await db.collection('users').insertOne(q.body);
    r.status(201).json({ success: true, id: databaseResults.insertedId, userId: databaseResults.insertedId });
  } catch (err) {
    r.status(500).json({ success: false, error: err.message });
  }
});

// Get all users
dbRoute.get('/', async (q, r) => {
  try {
    const db = getDB();
    const sweetledgerUsers = await db.collection('users').find().toArray();
    r.json(sweetledgerUsers);
  } catch (err) {
    r.status(500).json({ error: err.message });
  }
});

// Get expired passwords
dbRoute.get('/expired-passwords', async (req, res) => {
  try {
    const db = getDB();
    const currentDate = new Date();
    const expiryDays = 90; // Password expires after 90 days
    
    const users = await db.collection('users').find().toArray();
    
    const expiredUsers = users
      .map(user => {
        const lastChanged = user.passwordLastChanged ? new Date(user.passwordLastChanged) : new Date(user.createdAt);
        const daysSinceChange = Math.floor((currentDate - lastChanged) / (1000 * 60 * 60 * 24));
        
        return {
          ...user,
          passwordAge: daysSinceChange,
          passwordLastChanged: lastChanged
        };
      })
      .filter(user => user.passwordAge > expiryDays);
    
    res.status(200).json({ success: true, users: expiredUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user status (activate/deactivate)
dbRoute.put('/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { active } = req.body;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: active } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: `User not found.` });
    }

    res.status(200).json({ success: true, message: `User status updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Suspend user
dbRoute.put('/:id/suspend', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { startDate, expiryDate, reason } = req.body;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          suspended: true,
          suspendedUntil: expiryDate,
          suspensionStartDate: startDate,
          suspensionReason: reason
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: `User not found.` });
    }

    res.status(200).json({ success: true, message: `User suspended successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a user (general updates like username, email, role, etc.)
dbRoute.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating the _id field
    if (updateData._id) {
      delete updateData._id;
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: `User not found.` });
    }

    res.status(200).json({ success: true, message: `User updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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