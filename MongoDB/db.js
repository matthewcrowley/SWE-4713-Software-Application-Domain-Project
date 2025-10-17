require('dotenv').config();
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://dbUserMatthew:KSUappdomain@sweetledgercluster.jl1drsf.mongodb.net/sweetledgerdb?retryWrites=true&w=majority";
const mongoDBClient = new MongoClient(uri);

let database;

async function connectToDB() {
  await mongoDBClient.connect();
  database = mongoDBClient.db('sweetledgerdb');
  console.log('MongoDB connection established.');
}

function getDB() {
  if (!database) throw new Error('The database was not connected.');
  return database;
}

module.exports = {connectToDB, getDB};