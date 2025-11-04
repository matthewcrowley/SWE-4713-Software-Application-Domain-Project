const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventlogs = await db
      .collection('eventlogs')
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    const formattedLogs = eventlogs.map(log => ({
      ...log,
      beforeImage: log.before ? JSON.stringify(log.before, null, 2) : null,
      afterImage: log.after ? JSON.stringify(log.after, null, 2) : null,
      timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
    }));

    res.json(formattedLogs);

  } catch (err) {
    console.error('Failed to fetch event logs:', err);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

module.exports = router;