const express = require('express');
const router = express.Router();
const {logSystemError} = require('../utils/errorLogger');

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
      beforeImage: log.before || log.beforeImage || null,
      afterImage: log.after || log.afterImage || null,
      timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
    }));

    res.json(formattedLogs);

  } catch (err) {
    await logSystemError(err);
    console.error('Failed to fetch event logs:', err);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

module.exports = router;