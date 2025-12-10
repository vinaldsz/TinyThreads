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

    // Ensure only the owner can edit this listing
    if (String(existing.sellerId) !== String(session.user.id)) {
      console.log(
        '❌ User not authorized to edit this listing. SellerId:',
        existing.sellerId,
        'Session user id:',
        session.user.id,
      );
      return { error: 'Not authorized to edit this listing.' };
    }

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

    const donationRaw = formData.get('donation');
    const isDonation = donationRaw === 'true' || donationRaw === 'on';

    const latStr = formData.get('lat');
    const lngStr = formData.get('lng');
    const lat = latStr ? Number(latStr) : null;
    const lng = lngStr ? Number(lngStr) : null;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    console.log('Raw form data:', {
      title,
      category,
      condition,
      price,
      size,
      ageRange,
      location,
      description,
      donationRaw,
      latStr,
      lngStr,
    });

    // Optional: guard against extremely long descriptions
    if (description && String(description).length > 1000) {
      console.log('❌ Description too long after edit');
      return { error: 'Description is too long (max 1000 characters).' };
    }

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

    // Validate size against allowed dropdown values
    const allowedSizes = [
      '',
      'NB',
      '3M',
      '6M',
      '9M',
      '12M',
      '18M',
      '24M',
      '2T',
      '3T',
      '4T',
    ];
    const sizeValue = String(size || existing.size || '');
    if (!allowedSizes.includes(sizeValue)) {
      console.log('❌ Invalid size after edit:', sizeValue);
      return { error: 'Invalid size selected.' };
    }

    // Validate ageRange against allowed dropdown values
    const allowedAgeRanges = ['', '0-6M', '6-12M', '1-2Y', '2-3Y', '3-5Y'];
    const ageRangeValue = String(ageRange || existing.ageRange || '');
    if (!allowedAgeRanges.includes(ageRangeValue)) {
      console.log('❌ Invalid ageRange after edit:', ageRangeValue);
      return { error: 'Invalid age range selected.' };
    }

    const loc = String(location || existing.location || '').trim();
    if (!loc) {
      console.log('❌ Invalid location after edit');
      return { error: 'Please provide a valid location.' };
    }

    // If the user changed the location text, we require fresh coordinates
    const existingLoc = String(existing.location || '').trim();
    const locationChanged =
      typeof location === 'string' &&
      location.trim() &&
      location.trim() !== existingLoc;

    if (locationChanged && !hasCoords) {
      console.log(
        '❌ Location was changed but no new coordinates provided. Existing loc:',
        existingLoc,
        'New loc:',
        location,
      );
      return {
        error:
          'Updated location requires coordinates. Please use "Use my current location".',
      };
    }

    let finalPriceRaw = String(price ?? existing.price ?? '').trim();

    if (isDonation) {
      // For donation listings, force price to 0 and skip numeric precision checks
      finalPriceRaw = '0';
      console.log('Donation toggle is ON, forcing price to 0');
    } else {
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
    }

    // Step 7: Processing files...
    const existingImageUrlsFromForm =
      typeof formData.getAll === 'function'
        ? formData.getAll('existingImageUrls')
        : [];

    console.log('Existing image URLs from form:', existingImageUrlsFromForm);

    const rawFiles =
      typeof formData.getAll === 'function'
        ? formData.getAll('image')
        : [formData.get('image')];

    // Keep only real non-empty File/Blob-like objects. This prevents empty
    // or non-file values from untouched file inputs from being treated as errors.
    const files = rawFiles.filter(
      (f) =>
        f &&
        typeof f === 'object' &&
        typeof f.arrayBuffer === 'function' &&
        typeof f.size === 'number' &&
        f.size > 0,
    );
    console.log('Files found (valid non-empty files):', files.length);

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

    // Always trust the form. If user removed all existing images, this array will be empty.
    let imageUrls = existingImageUrlsFromForm.map((url) => String(url));

    // If user provided new images, upload them and APPEND to the kept URLs
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
      imageUrls = [...imageUrls, ...newImageUrls];
      console.log('Combined imageUrls (existing + new):', imageUrls);
      // Note: Old S3 objects that were removed by the user are now orphaned;
      // they can be cleaned in a separate maintenance step if needed.
    }

    if (!imageUrls || imageUrls.length === 0) {
      console.log('❌ No images remaining after edit');
      return {
        error: 'Please keep at least one image or upload a new one.',
      };
    }

    // Step 9: Building update document...
    const updateDoc = {
      title: t,
      category: cat,
      condition: cond,
      price: Number(finalPriceRaw),
      size: sizeValue,
      ageRange: ageRangeValue,
      location: loc,
      description: description
        ? String(description)
        : existing.description || '',
      imageUrls,
      updatedAt: new Date(),
    };

    // Geo-location handling:
    // - If new coordinates are provided, update geoLocation.
    // - Otherwise, preserve the existing geoLocation (if any).
    if (hasCoords) {
      updateDoc.geoLocation = {
        type: 'Point',
        coordinates: [lng, lat],
      };
      console.log(
        'Updated geoLocation with new coords:',
        updateDoc.geoLocation,
      );
    } else if (existing.geoLocation) {
      updateDoc.geoLocation = existing.geoLocation;
      console.log(
        'No new coords provided, preserving existing geoLocation:',
        existing.geoLocation,
      );
    }

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
