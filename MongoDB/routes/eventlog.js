const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', async (r, s) => {
  try {
    const db = getDB();
    const eventlogs = await db.collection('eventlogs').find({}).toArray();

    const formattedLogs = eventlogs.map(log => ({
      ...log,
      before: log.beforeImage || null,
      after: log.afterImage || null,
    }));

    s.json(formattedLogs);

  } catch (e) {
    console.error('The system failed to fetch the event logs:', e);
    s.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

module.exports = router;