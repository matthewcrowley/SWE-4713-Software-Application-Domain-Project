async function logEvent(db, {userId, action, before, after}) {
  await db.collection('eventlogs').insertOne({
    userId,
    action,
    timestamp: new Date(),
    before,
    after,
  });
}
module.exports = logEvent;