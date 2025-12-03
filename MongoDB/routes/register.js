const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const logEvent = require('../utils/logEvent');

dbRoute.post('/', async (req, res) => {
  try {
    const mongoDB = getDB();
    const {firstName, lastName, address, dob, email, username, passwordHash, secQuestion1, secQuestion2, secQuestion3} = req.body;

    if (!firstName || !lastName || !email || !username || !passwordHash || !secQuestion1 || !secQuestion2 || !secQuestion3) {
      return res.status(400).json({ success: false, message: 'Missing required inputs' });
    }

    const newUser = {
      firstName,
      lastName,
      address,
      dob,
      email,
      username,
      passwordHash,
      secQuestion1,
      secQuestion2,
      secQuestion3,
      createdAt: new Date(),
      passwordUpdatedAt: new Date(),
      approved: true,
      role: " ", 
      suspended: false, 
      active: true
    };

    const result = await mongoDB.collection('users').insertOne(newUser);

    // Fetch the actual inserted document from MongoDB
    const insertedUser = await mongoDB.collection('users').findOne({ _id: result.insertedId });

    await logEvent(mongoDB, {
      userId: insertedUser._id,
      action: 'New user registered',
      timestamp: new Date(),
      before: null,
      after: { 
        firstName: insertedUser.firstName,
        lastName: insertedUser.lastName,
        address: insertedUser.address,
        dob: insertedUser.dob,
        email: insertedUser.email,
        username: insertedUser.username,
        secQuestion1: insertedUser.secQuestion1,
        secQuestion2: insertedUser.secQuestion2,
        secQuestion3: insertedUser.secQuestion3,
       _id: insertedUser._id.toString(),
      }
    });

    res.json({ success: true, insertedId: insertedUser._id });

  } catch (e) {
    console.error('Error inserting user:', e);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = dbRoute;