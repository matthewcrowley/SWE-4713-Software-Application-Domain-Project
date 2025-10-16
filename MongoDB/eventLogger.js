const { ObjectId } = require('mongodb');

async function logEvent({ userId, action, collectionName, documentId, before, after, db }) {
  const eventLog = {
    userId,
    timestamp: new Date(),
    action,
    collection: collectionName,
    documentId,
    before: before || null,
    after: after || null,
  };

  await db.collection('eventlogs').insertOne(eventLog);
}

async function updateAccount(userId, accountIdStr, updateData, db) {
  const accountId = new ObjectId(accountIdStr);
  const collection = db.collection('accounts');

  const before = await collection.findOne({ _id: accountId });

  await collection.updateOne({ _id: accountId }, { $set: updateData });

  const after = await collection.findOne({ _id: accountId });

  await logEvent({
    userId,
    action: 'update',
    collectionName: 'accounts',
    documentId: accountId,
    before,
    after,
    db
  });
}

module.exports = { logEvent, updateAccount };