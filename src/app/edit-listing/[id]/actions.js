'use server';

import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadImageToS3 } from '@/lib/awss3.js';

export async function updateListingAction(formData) {
  console.log('\n=== UPDATE LISTING ACTION STARTED ===');

  try {
    // Step 1: Session check
    console.log('Step 1: Getting session...');
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log('❌ No session - cannot edit');
      return { error: 'Not authenticated' };
    }
    console.log('✅ User logged in:', session.user.id);

    // Step 2: Get listing id
    console.log('\nStep 2: Extracting listing id...');
    const id = formData.get('id');
    if (!id) {
      console.log('❌ Missing listing id');
      return { error: 'Missing listing id' };
    }
    console.log('Listing id:', id);

    // Step 3: Connect to DB
    console.log('\nStep 3: Connecting to database...');
    const { getDb } = await import('@/lib/mongodb');
    const db = await getDb();
    const collection = db.collection('Listings');
    console.log('✅ Database connected');

    // Step 4: Find existing listing
    console.log('\nStep 4: Fetching existing listing...');
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      console.log('❌ Listing not found');
      return { error: 'Listing not found' };
    }
    console.log('Existing listing:', JSON.stringify(existing, null, 2));

    // Step 6: Extract updated fields (fallback to existing if empty)
    console.log('\nStep 6: Extracting updated fields...');
    const title = formData.get('title');
    const category = formData.get('category');
    const condition = formData.get('condition');
    const price = formData.get('price');
    const size = formData.get('size');
    const ageRange = formData.get('ageRange');
    const location = formData.get('location');
    const description = formData.get('description');

    console.log('Raw form data:', {
      title,
      category,
      condition,
      price,
      size,
      ageRange,
      location,
      description,
    });

    // Apply same validations style as add-listing but more lenient:
    const t = (title || existing.title || '').trim();
    if (!t || t.length < 3 || t.length > 150) {
      console.log('❌ Invalid title after edit');
      return { error: 'Please provide a valid title.' };
    }

    const allowedCategories = ['clothing', 'toys', 'books', 'gear'];
    const cat = String(category || existing.category || '');
    if (!allowedCategories.includes(cat)) {
      console.log('❌ Invalid category after edit:', cat);
      return { error: 'Please select a valid category.' };
    }

    const allowedConditions = ['new', 'like-new', 'good', 'fair'];
    const cond = String(condition || existing.condition || '');
    if (!allowedConditions.includes(cond)) {
      console.log('❌ Invalid condition after edit:', cond);
      return { error: 'Please select a valid condition.' };
    }

    let finalPriceRaw = String(price ?? existing.price ?? '').trim();
    const finalPriceNum = Number(finalPriceRaw);
    if (
      !finalPriceRaw ||
      !Number.isFinite(finalPriceNum) ||
      finalPriceNum < 0
    ) {
      console.log('❌ Invalid price after edit:', finalPriceRaw);
      return { error: 'Please provide a valid price (0 or higher).' };
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(finalPriceRaw)) {
      console.log('❌ Invalid price precision after edit:', finalPriceRaw);
      return { error: 'Price must have at most 2 decimal places.' };
    }

    // Step 7: Handle images (optional replace)
    console.log('\nStep 7: Processing files...');
    const rawFiles =
      typeof formData.getAll === 'function'
        ? formData.getAll('image')
        : [formData.get('image')];

    const files = rawFiles.filter(
      (f) => f && typeof f === 'object' && typeof f.arrayBuffer === 'function',
    );
    console.log('Files found:', files.length);

    const MAX_BYTES = 5 * 1024 * 1024;
    for (const file of files) {
      if (typeof file.size === 'number' && file.size > MAX_BYTES) {
        console.log('❌ File too large:', file.size);
        return { error: 'File too large. Max 5MB per image.' };
      }
      if (file.type && !String(file.type).startsWith('image/')) {
        console.log('❌ Invalid file type:', file.type);
        return { error: 'Only image files are allowed.' };
      }
    }
    console.log('✅ Files validated');

    let imageUrls = existing.imageUrls || [];

    // If user provided new images, upload them and REPLACE the old URLs in DB
    if (files.length > 0) {
      console.log('\nStep 8: Uploading new images to S3...');
      const newImageUrls = [];
      for (const file of files) {
        console.log('  Uploading file:', file.name);
        const { imageUrl } = await uploadImageToS3(file, {
          folder: 'items',
          filenamePrefix: 'item',
        });
        newImageUrls.push(imageUrl);
        console.log('  ✅ Uploaded:', imageUrl);
      }
      imageUrls = newImageUrls;
      console.log('New imageUrls:', imageUrls);
      // Note: Old S3 objects are now orphaned; can be cleaned in a separate maintenance step if needed.
    }

    // Step 9: Build update document
    console.log('\nStep 9: Building update document...');
    const updateDoc = {
      title: t,
      category: cat,
      condition: cond,
      price: Number(finalPriceRaw),
      size: size ? String(size) : existing.size || '',
      ageRange: ageRange ? String(ageRange) : existing.ageRange || '',
      location: location ? String(location) : existing.location || '',
      description: description
        ? String(description)
        : existing.description || '',
      imageUrls,
      updatedAt: new Date(),
    };

    console.log('Update document:', JSON.stringify(updateDoc, null, 2));

    // Step 10: Apply update
    console.log('\nStep 10: Updating document in database...');
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    console.log('✅ Listing updated');

    return { success: true };
  } catch (error) {
    console.error('\n❌ ERROR in updateListingAction:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return { error: 'Internal server error' };
  }
}
