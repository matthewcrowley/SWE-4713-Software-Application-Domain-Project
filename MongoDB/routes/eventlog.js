const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = getDB();

    // Fetch all event logs from the database
    const eventlogs = await db.collection('eventlogs').find({}).toArray();

    // Map the logs to include 'before' and 'after' fields for frontend compatibility
    const formattedLogs = eventlogs.map(log => ({
      ...log,
      before: log.beforeImage || null,
      after: log.afterImage || null,
    }));

    // Return the formatted logs
    res.json(formattedLogs);

  } catch (err) {
    console.error('Failed to fetch event logs:', err);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

module.exports = router;