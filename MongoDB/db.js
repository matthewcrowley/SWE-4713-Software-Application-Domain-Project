require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("Missing MONGO_URI in environment variables");
}

const mongoDBClient = new MongoClient(uri);

let database;

async function connectToDB() {
  try {
    await mongoDBClient.connect();
    database = mongoDBClient.db();
    console.log('The MongoDB connection was established.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

function getDB() {
  if (!database) throw new Error('There was an error and the database was not connected.');
  return database;
}

module.exports = {connectToDB, getDB};
