const { MongoClient } = require('mongodb');

const uri = 'your-mongodb-connection-string-here';
const client = new MongoClient(uri);

let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('sweetledgerdb');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

function getDB() {
  if (!db) {
    throw new Error('❌ Database not initialized. Call connectToDB first.');
  }
  return db;
}

module.exports = { connectToDB, getDB };