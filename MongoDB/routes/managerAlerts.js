const express = require('express');
const router = express.Router();
const {logSystemError} = require('../utils/errorLogger');

module.exports = (db) => {
  router.get('/', async (req, res) => {
    try {
      const alerts = [];

      // 1. Pending journal entries that require approval
      const pendingEntries = await db.collection('journal_entries')
        .find({ status: "Pending Approval" })
        .toArray();

      if (pendingEntries.length > 0) {
        alerts.push({
          type: "approval",
          message: `${pendingEntries.length} journal entr${pendingEntries.length === 1 ? 'y is' : 'ies are'} awaiting approval.`,
        });
      }

      // 2. Unposted (draft) journal entries
      const drafts = await db.collection('journal_entries')
        .find({ status: "Draft" })
        .toArray();

      if (drafts.length > 0) {
        alerts.push({
          type: "draft",
          message: `${drafts.length} journal entr${drafts.length === 1 ? 'y is' : 'ies are'} still in draft status.`,
        });
      }

      // 3. Critical event log notices  
      const criticalEvents = await db.collection('event_log')
        .find({ level: "critical" })
        .toArray();

      if (criticalEvents.length > 0) {
        alerts.push({
          type: "critical",
          message: `${criticalEvents.length} critical event log entr${criticalEvents.length === 1 ? 'y' : 'ies'} detected.`,
        });
      }

      // 4. Accounts needing review (example condition)
      const flaggedAccounts = await db.collection('accounts')
        .find({ flagged: true })
        .toArray();

      if (flaggedAccounts.length > 0) {
        alerts.push({
          type: "accounts",
          message: `${flaggedAccounts.length} account${flaggedAccounts.length === 1 ? '' : 's'} require review.`,
        });
      }

      res.json({ alerts });
    } catch (error) {
      await logSystemError(error);
      console.error("Error loading manager alerts:", error);
      res.status(500).json({ error: "Failed to load alerts" });
    }
  });

  return router;
};
