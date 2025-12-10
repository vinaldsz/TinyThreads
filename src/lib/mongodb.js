// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri && process.env.NODE_ENV !== 'test') {
  throw new Error('Please add MONGODB_URI to .env.local');
}

if (!uri && process.env.NODE_ENV === 'test') {
  clientPromise = Promise.resolve(null);
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(dbName) {
  const client = await clientPromise;

  if (!client) {
    throw new Error('Database client is not initialized.');
  }

  const name = dbName || process.env.MONGODB_DB || undefined;
  return client.db(name);
}
