const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const logEvent = require('../utils/logEvent');
const {logSystemError} = require('../utils/errorLogger');

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
      role: "Accountant", 
      suspended: false, 
      active: true
    };

    const result = await mongoDB.collection('users').insertOne(newUser);

    // Fetch the actual inserted document from MongoDB
    const insertedUser = await mongoDB.collection('users').findOne({ _id: result.insertedId });

    await mongoDB.collection('eventlogs').insertOne( {
      user: newUser.username,
      action: 'New user registered',
      targetType: 'userCreated',
      timestamp: new Date(),
      beforeImage: null,
      afterImage: { 
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        dob: newUser.dob,
        email: newUser.email,
        username: newUser.username,
       _id: newUser._id.toString(),
      }
    });

    res.json({ success: true, insertedId: insertedUser._id });

  } catch (e) {
    await logSystemError(e);
    console.error('Error inserting user:', e);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = dbRoute;