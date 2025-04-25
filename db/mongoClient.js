const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectToMongo() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log('Connected to MongoDB');
}

function getDB() {
  return db;
}

module.exports = { connectToMongo, getDB };