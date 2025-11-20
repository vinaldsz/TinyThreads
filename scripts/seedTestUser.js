// Simple seed script to create a test user in the MongoDB `users` collection.
// Usage: node scripts/seedTestUser.js

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith("\'") && val.endsWith("\'")) ||
      (val.startsWith('"') && val.endsWith('"'))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

(async function main() {
  try {
    const env = loadEnvLocal();
    const mongoUri =
      env.MONGODB_URI || env.MONGODB_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env.local or environment.');
      process.exit(1);
    }

    const client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const dbName =
      env.MONGODB_DB || env.MongoDB_DB || process.env.MONGODB_DB || undefined;
    const db = dbName ? client.db(dbName) : client.db();
    const users = db.collection('users');

    const email = 'test@example.com';
    const password = 'Password123';
    const name = 'Test User';

    const existing = await users.findOne({ email });
    if (existing) {
      console.log('Test user already exists:', email);
      await client.close();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    };

    const res = await users.insertOne(user);
    console.log('Inserted test user with _id:', res.insertedId.toString());
    console.log('Credentials ->', email, '/', password);
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding test user:', err);
    process.exit(1);
  }
})();
