const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const logEvent = require('../utils/logEvent'); // ✅ Make sure this is correct

dbRoute.post('/', async (q, r) => {
  try {
    const mongoDB = getDB();
    const { firstName, lastName, address, dob, email, username, passwordHash } = q.body;

    if (!firstName || !lastName || !email || !username || !passwordHash) {
      return r.status(400).json({ success: false, message: 'Missing the required inputs' });
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

    // ✅ Insert new user into users collection
    const result = await mongoDB.collection('users').insertOne(newUser);

    // ✅ Log the registration event
    await logEvent(mongoDB, {
      userId: result.insertedId,
      action: 'New user registered',
      timestamp: new Date(),
      before: null,
      after: {
        firstName,
        lastName,
        address,
        dob,
        email,
        username,
      },
    });

    // ✅ Respond success
    r.json({ success: true, insertedId: result.insertedId });

  } catch (error) {
    console.error('Error inserting user:', error);
    r.status(500).json({ success: false, message: 'There was an error with the server.' });
  }
});

module.exports = dbRoute;