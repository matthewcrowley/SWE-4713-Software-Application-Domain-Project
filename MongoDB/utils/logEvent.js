// utils/logEvent.js
async function logEvent(db, { userId, action, collectionName, documentId, before, after }) {
  try {
    await db.collection('eventlogs').insertOne({
      userId,
      timestamp: new Date(),
      action,
      collection: collectionName || 'users',
      documentId: documentId || null,
      before: before || null,
      after: after || null,
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }
}

module.exports = logEvent;