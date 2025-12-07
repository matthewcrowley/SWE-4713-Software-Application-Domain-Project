const {logSystemError} = require('./utils/errorLogger');

async function logEvent(db, { userId, action, collectionName, documentId, beforeImage, afterImage }) {
  try {
    await db.collection('eventlogs').insertOne({
      userId,
      timestamp: new Date(),
      action,
      collection: collectionName || 'users',
      documentId: documentId || null,
      beforeImage: beforeImage || null,
      afterImage: afterImage || null,
    });
  } catch (err) {
    await logSystemError(err);
    console.error('Failed to log event:', err);
  }
}

module.exports = logEvent;