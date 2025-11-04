const { ObjectId } = require('mongodb');

/**
 * Log an event to the 'eventlogs' collection.
 */
async function logEvent(db, { userId, action, collectionName, documentId, beforeImage, afterImage }) {
  try {
    const eventLog = {
      userId,
      timestamp: new Date(),
      action,
      collectionName,
      documentId: documentId ? documentId.toString() : null,
      beforeImage: before || null,
      afterImage: after || null,
    };

    const result = await db.collection('eventlogs').insertOne(eventLog);
    console.log(`Event logged: ${result.insertedId} (${action} on ${collectionName})`);
  } catch (err) {
    console.error('Failed to log event:', err);
  }
}

/**
 * Create a document and log the event.
 */
async function logAndCreate({ db, userId, collection, data }) {
  const col = db.collection(collection);
  const result = await col.insertOne(data);
  const inserted = await col.findOne({ _id: result.insertedId });

  await logEvent(db, {
    userId,
    action: 'create',
    collectionName: collection,
    documentId: result.insertedId,
    beforeImage: null,
    afterImage: inserted,
  });

  return inserted;
}

/**
 * Update a document and log the event.
 */
async function logAndUpdate({ db, userId, collection, documentId, updateData }) {
  const col = db.collection(collection);
  const objId = new ObjectId(documentId);

  const before = await col.findOne({ _id: objId });
  if (!before) throw new Error(`Document not found: ${documentId} in ${collection}`);

  await col.updateOne({ _id: objId }, { $set: updateData });
  const after = await col.findOne({ _id: objId });

  await logEvent(db, {
    userId,
    action: 'update',
    collectionName: collection,
    documentId: objId,
    beforeImage,
    afterImage,
  });

  return afterImage;
}

/**
 * Deactivate a document (set active = false) and log the event.
 */
async function logAndDeactivate({ db, userId, collection, documentId }) {
  const col = db.collection(collection);
  const objId = new ObjectId(documentId);

  const before = await col.findOne({ _id: objId });
  if (!before) throw new Error(`Document not found: ${documentId} in ${collection}`);

  await col.updateOne({ _id: objId }, { $set: { active: false } });
  const after = await col.findOne({ _id: objId });

  await logEvent(db, {
    userId,
    action: 'deactivate',
    collectionName: collection,
    documentId: objId,
    beforeImage,
    afterImage,
  });

  return afterImage;
}

/**
 * Delete a document and log the event.
 */
async function logAndDelete({ db, userId, collection, documentId }) {
  const col = db.collection(collection);
  const objId = new ObjectId(documentId);

  const before = await col.findOne({ _id: objId });
  if (!before) throw new Error(`Document not found: ${documentId} in ${collection}`);

  await col.deleteOne({ _id: objId });

  await logEvent(db, {
    userId,
    action: 'delete',
    collectionName: collection,
    documentId: objId,
    beforeImage,
    afterImage: null,
  });

  return beforeImage;
}

module.exports = {
  logEvent,
  logAndCreate,
  logAndUpdate,
  logAndDeactivate,
  logAndDelete,
};