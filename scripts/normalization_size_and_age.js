// scripts/normalization_size_and_age.js
// EXACT copy of working testConnection.js setup + normalization

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory - SAME AS testConnection.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - SAME AS testConnection.js
dotenv.config({ path: path.join(__dirname, '../.env.local') });

console.log('🔍 Environment check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT FOUND');

// Size mapping function
function normalizeSize(rawSize) {
  if (!rawSize) return null;
  
  const size = rawSize.toLowerCase().trim();
  
  // Based on your actual data patterns:
  
  // "0-3" pattern (newborn)
  if (size === '0-3' || size.includes('newborn') || size.includes('nb') || size === '0-3m' || size === '0-3 months') {
    return 'NB';
  }
  
  // "1" could mean 3-6 months
  if (size === '1' || size.includes('3m') || size.includes('3 month') || size === '3-6m') {
    return '3M';
  }
  
  // "2" could mean 6-9 months
  if (size === '2' || size.includes('6m') || size.includes('6 month') || size === '6-9m') {
    return '6M';
  }
  
  // "3" could mean 9-12 months  
  if (size === '3' || size.includes('9m') || size.includes('9 month') || size === '9-12m') {
    return '9M';
  }
  
  // "4" could mean 12 months
  if (size === '4' || size.includes('12m') || size.includes('12 month') || size.includes('1 year')) {
    return '12M';
  }
  
  // "5" could mean 18 months
  if (size === '5' || size.includes('18m') || size.includes('18 month')) {
    return '18M';
  }
  
  // "6" could mean 24 months
  if (size === '6' || size.includes('24m') || size.includes('24 month') || size.includes('2 years')) {
    return '24M';
  }
  
  // Toddler sizes
  if (size.includes('2t') || (size.includes('2') && size.includes('year'))) {
    return '2T';
  }
  if (size.includes('3t') || (size.includes('3') && size.includes('year'))) {
    return '3T';
  }
  if (size.includes('4t') || (size.includes('4') && size.includes('year'))) {
    return '4T';
  }
  
  // Invalid/unclear data like "sd" - ask user to review manually
  if (size.length < 3 && !size.match(/^[0-6]$/)) {
    console.log(`⚠️  UNCLEAR SIZE - needs manual review: "${rawSize}"`);
    return null; // Set to null so user can fix manually
  }
  
  // Fallback: return original if no match found
  console.log(`⚠️  Could not normalize size: "${rawSize}"`);
  return rawSize;
}

// Age range mapping function
function normalizeAgeRange(rawAge) {
  if (!rawAge) return null;
  
  const age = rawAge.toLowerCase().trim();
  
  // Based on your actual data patterns:
  
  // "0-1 years" pattern
  if (age === '0-1 years' || age.includes('0-1') || age.includes('newborn') || 
      age.includes('0-3') || age.includes('3-6') || age.includes('infant') || age.includes('baby')) {
    return '0-6M';
  }
  
  // "1-2" pattern (could mean 1-2 years)
  if (age === '1-2' || age.includes('1-2') || age.includes('toddler') || 
      age.includes('18 month') || age.includes('24 month')) {
    return '1-2Y';
  }
  
  // Single numbers - interpret based on context
  if (age === '12') {
    return '6-12M'; // 12 months = 6-12M range
  }
  
  // 6-12 months patterns
  if (age.includes('6-12') || age.includes('6 month') || age.includes('9 month') || 
      age.includes('12 month') || age.includes('1 year')) {
    return '6-12M';
  }
  
  // 2-3 years patterns
  if (age.includes('2-3') || age.includes('2t') || age.includes('3t')) {
    return '2-3Y';
  }
  
  // 3-5 years patterns
  if (age.includes('3-5') || age.includes('4t') || age.includes('5t') || 
      age.includes('preschool') || age.includes('4 year') || age.includes('5 year')) {
    return '3-5Y';
  }
  
  // Unclear single numbers - needs manual review
  if (age.match(/^\d+$/) && age !== '12') {
    console.log(`⚠️  UNCLEAR AGE RANGE - needs manual review: "${rawAge}"`);
    return null; // Set to null so user can fix manually
  }
  
  // Fallback: return original if no match found
  console.log(`⚠️  Could not normalize age range: "${rawAge}"`);
  return rawAge;
}

// Main normalization function
async function normalizeExistingData() {
  console.log('🚀 Starting data normalization...');
  
  try {
    // Import MongoDB AFTER env variables are loaded - SAME AS testConnection.js
    const { getDb } = await import('../src/lib/mongodb.js');
    
    console.log('🚀 Attempting to connect to MongoDB...');
    const db = await getDb();
    console.log('✅ Successfully connected to MongoDB!');
    
    const collection = db.collection('Listings');
    
    // Get all items that need normalization
    const items = await collection.find({}).toArray();
    console.log(`📦 Found ${items.length} items to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    let needsManualReview = [];
    
    for (const item of items) {
      try {
        const updates = {};
        
        // Show current values for first few items
        if (updatedCount < 5) {
          console.log(`\n📋 Processing: ${item.title || 'Untitled'}`);
          console.log(`   Current size: "${item.size || 'NOT SET'}"`);
          console.log(`   Current ageRange: "${item.ageRange || 'NOT SET'}"`);
        }
        
        // Normalize size if it exists and needs normalization
        if (item.size) {
          const normalizedSize = normalizeSize(item.size);
          if (normalizedSize === null) {
            needsManualReview.push({
              title: item.title || 'Untitled',
              field: 'size',
              current: item.size,
              id: item._id
            });
          } else if (normalizedSize !== item.size) {
            updates.size = normalizedSize;
            console.log(`📏 Size: "${item.size}" → "${normalizedSize}"`);
          }
        }
        
        // Normalize age range if it exists and needs normalization
        if (item.ageRange) {
          const normalizedAge = normalizeAgeRange(item.ageRange);
          if (normalizedAge === null) {
            needsManualReview.push({
              title: item.title || 'Untitled',
              field: 'ageRange',
              current: item.ageRange,
              id: item._id
            });
          } else if (normalizedAge !== item.ageRange) {
            updates.ageRange = normalizedAge;
            console.log(`📅 Age: "${item.ageRange}" → "${normalizedAge}"`);
          }
        }
        
        // Update the item if there are changes
        if (Object.keys(updates).length > 0) {
          await collection.updateOne(
            { _id: item._id },
            { $set: updates }
          );
          updatedCount++;
          console.log(`✅ Updated: ${item.title || 'Untitled'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating item ${item._id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Normalization complete!');
    console.log(`✅ Successfully updated: ${updatedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📊 Total processed: ${items.length} items`);
    
    if (needsManualReview.length > 0) {
      console.log('\n⚠️  Items needing manual review:');
      needsManualReview.forEach(item => {
        console.log(`- "${item.title}": ${item.field} = "${item.current}" (ID: ${item.id})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the normalization
normalizeExistingData();