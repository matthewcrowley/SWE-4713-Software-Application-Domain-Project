const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const errors = await db.collection('error_message')
      .find()
      .sort({ timestamp: -1 })
      .toArray();

    res.json({ success: true, errors });
  } catch (err) {
    console.error("Failed to fetch system errors:", err);
    res.status(500).json({ success: false, message: "Server error fetching errors" });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Error message is required" });
    }

    const errorEntry = {
      errorId: new ObjectId(),
      timestamp: new Date(),
      message
    };

    await db.collection('error_message').insertOne(errorEntry);

    res.json({ success: true, error: errorEntry });
  } catch (err) {
    console.error("Failed to log system error:", err);
    res.status(500).json({ success: false, message: "Server error logging error" });
  }
});

module.exports = router;