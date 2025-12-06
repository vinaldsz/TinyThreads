// scripts/testConnection.js
// Simple test to check MongoDB connection

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

console.log('🔍 Environment check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT FOUND');

// Try to connect
try {
  const { getDb } = await import('../src/lib/mongodb.js');
  
  console.log('🚀 Attempting to connect to MongoDB...');
  const db = await getDb();
  console.log('✅ Successfully connected to MongoDB!');
  
  // Test query
  const collection = db.collection('Listings');
  const count = await collection.countDocuments();
  console.log(`📦 Found ${count} items in Listings collection`);
  
  // Show sample of first 3 items with size and ageRange
  const samples = await collection.find({}).limit(3).toArray();
  console.log('\n📋 Sample data:');
  
  samples.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Size: "${item.size || 'NOT SET'}"`);
    console.log(`   Age Range: "${item.ageRange || 'NOT SET'}"`);
    console.log('---');
  });
  
} catch (error) {
  console.error('❌ Connection failed:', error.message);
}