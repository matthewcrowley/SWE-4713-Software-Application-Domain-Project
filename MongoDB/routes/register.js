const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { firstName, lastName, address, dob, email, username, passwordHash } = req.body;

    if (!firstName || !lastName || !email || !username || !passwordHash) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newUser = {
      firstName,
      lastName,
      address,
      dob,
      email,
      username,
      passwordHash,
      createdAt: new Date(),
      approved: false,
    };

    const result = await db.collection('users').insertOne(newUser);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
