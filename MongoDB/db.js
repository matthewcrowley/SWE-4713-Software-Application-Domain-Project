require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://dbUserMatthew:KSUappdomain@sweetledgercluster.jl1drsf.mongodb.net/sweetledgerdb?retryWrites=true&w=majority";

const client = new MongoClient(uri);

let db;

async function connectToDB() {
  await client.connect();
  db = client.db('sweetledgerdb');
  console.log('Connected to MongoDB Atlas');
}

function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

module.exports = { connectToDB, getDB };