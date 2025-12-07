const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const {logSystemError} = require('../utils/errorLogger');

dbRoute.post('/', async (req, res) => {
  try {
    const db = getDB();

    console.log("🚀 Creating new user...", req.body);

    const result = await db.collection('users').insertOne(req.body);

    const newUser = await db.collection('users').findOne({ _id: result.insertedId });

    const createdBy = req.body.created_by || "system";

    try {
      const eventResult = await db.collection('eventlogs').insertOne({
        user: createdBy,
        action: "User created",
        targetType: "userCreated",
        timestamp: new Date(),
        beforeImage: null,
        afterImage: newUser
      });
    } catch (err) {
      console.error("EVENT LOG FAILED:", err);
    }

    return res.status(201).json({
      success: true,
      id: result.insertedId,
      userId: result.insertedId
    });

  } catch (err) {
    await logSystemError(err);
    return res.status(500).json({ success: false, error: err.message });
// Create a new user
dbRoute.post('/', async (q, r) => {
  try {
    const db = getDB();
    const databaseResults = await db.collection('users').insertOne(q.body);
    r.status(201).json({ success: true, id: databaseResults.insertedId, userId: databaseResults.insertedId });
  } catch (err) {
    await logSystemError(err);
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
    await logSystemError(err);
    r.status(500).json({ error: err.message });
  }
});

// Get expired passwords - MUST come before /:id routes
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
    await logSystemError(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user status (activate/deactivate) - MUST come before general /:id route
dbRoute.put('/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { active } = req.body;

    console.log('Status update for user ID:', id); // Debug log

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: active } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: `User not found.` });
    }

    res.status(200).json({ success: true, message: `User status updated successfully.` });
  } catch (err) {
    await logSystemError(err);
    console.error('Status update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Suspend user - MUST come before general /:id route
dbRoute.put('/:id/suspend', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { startDate, expiryDate, reason } = req.body;

    console.log('Suspending user ID:', id); // Debug log

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
    await logSystemError(err);
    console.error('Suspend error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unsuspend user - MUST come before general /:id route
dbRoute.put('/:id/unsuspend', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    console.log('Unsuspending user ID:', id); // Debug log

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          suspended: false
        },
        $unset: {
          suspendedUntil: "",
          suspensionStartDate: "",
          suspensionReason: ""
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: `User not found.` });
    }

    console.log('User unsuspended successfully'); // Debug log
    res.status(200).json({ success: true, message: `User unsuspended successfully.` });
  } catch (err) {
    await logSystemError(err);
    console.error('Unsuspend error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a user (general updates like username, email, role, etc.)
// This MUST come AFTER all the specific /:id/* routes
dbRoute.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    console.log('General update for user ID:', id); // Debug log

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
    await logSystemError(err);
    console.error('Update error:', err);
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
    await logSystemError(err);
    console.error('Error fetching expired passwords:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = dbRoute;