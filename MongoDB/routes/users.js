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

module.exports = dbRoute;