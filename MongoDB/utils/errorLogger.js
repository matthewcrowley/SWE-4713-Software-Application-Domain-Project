const {getDB} = require('../db');
const {ObjectId} = require('mongodb');

const logSystemError = async (error, meta = {}) => {
  try {
    const db = getDB();
    const errorEntry = {
      errorId: new ObjectId(),
      timestamp: new Date(),
      message: error.toString(),
      ...meta,
    };
    await db.collection('error_message').insertOne(errorEntry);
  } catch (err) {
    console.error("Failed to log system error:", err);
  }
};

module.exports = { logSystemError };