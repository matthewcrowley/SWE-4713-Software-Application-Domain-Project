const express = require('express');
const dbRoute = express.Router();
const { getDB } = require('../db');
const logEvent = require('../utils/logEvent');

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

    const result = await mongoDB.collection('users').insertOne(newUser);

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

    r.json({ success: true, insertedId: result.insertedId });

  } catch (e) {
    console.error('Error inserting user:', e);
    r.status(500).json({ success: false, message: 'There was an error with the server.' });
  }
});

module.exports = dbRoute;