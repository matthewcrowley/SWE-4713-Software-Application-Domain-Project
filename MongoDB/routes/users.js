const express = require('express');
const dbRoute = express.Router();
const {getDB} = require('../db');
const {ObjectId} = require('mongodb');
const {logSystemError} = require('../utils/errorLogger');

dbRoute.post('/', async (req, res) => {
  try {
    const db = getDB();

    console.log("🚀 Creating new user...", req.body);

    const result = await db.collection('users').insertOne(req.body);

    const newUser = await db.collection('users').findOne({
      _id: result.insertedId
    });

    const createdBy = req.body.created_by || "system";

    // Event log
    try {
      await db.collection('eventlogs').insertOne({
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
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

dbRoute.get('/', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    await logSystemError(err);
    res.status(500).json({ error: err.message });
  }
});

dbRoute.get('/expired-passwords', async (req, res) => {
  try {
    const db = getDB();
    const currentDate = new Date();
    const expiryDays = 90;

    const users = await db.collection('users').find().toArray();

    const expiredUsers = users
      .map(user => {
        const lastChanged = user.passwordLastChanged
          ? new Date(user.passwordLastChanged)
          : new Date(user.createdAt);

        const daysSinceChange = Math.floor(
          (currentDate - lastChanged) / (1000 * 60 * 60 * 24)
        );

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

dbRoute.put('/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { active } = req.body;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { active } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User status updated successfully." });

  } catch (err) {
    await logSystemError(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User suspended successfully." });

  } catch (err) {
    await logSystemError(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

dbRoute.put('/:id/unsuspend', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid user ID format" });

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { suspended: false },
        $unset: {
          suspendedUntil: "",
          suspensionStartDate: "",
          suspensionReason: ""
        }
      }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User unsuspended successfully." });

  } catch (err) {
    await logSystemError(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

dbRoute.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    if (updateData._id) delete updateData._id;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User updated successfully." });

  } catch (err) {
    await logSystemError(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = dbRoute;