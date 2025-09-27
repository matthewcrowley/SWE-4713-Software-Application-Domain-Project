require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;

async function connectToDB() {
  await client.connect();
  db = client.db('sweetledgerdb'); // your DB name here
  console.log('Connected to MongoDB Atlas');
}

function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

module.exports = { connectToDB, getDB };