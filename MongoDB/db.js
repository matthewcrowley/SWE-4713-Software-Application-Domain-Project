const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://dbUserMatthew:sweetledgerKSU@sweetledgercluster.jl1drsf.mongodb.net/sweetledgerdb?retryWrites=true&w=majority';

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