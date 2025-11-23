'use server';

import { redirect } from 'next/navigation';
import { uploadImageToS3 } from '@/lib/awss3.js';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function uploadListingAction(formData) {
  console.log('\n=== UPLOAD LISTING ACTION STARTED ===');
  
  try {
    // Get the logged-in user
    console.log('Step 1: Getting session...');
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));

    // Check if the user is logged in 
    if (!session?.user?.id) {
      console.log('❌ No session - redirecting to login');
      redirect('/login');
    }
    console.log('✅ User logged in:', session.user.id);
    
    console.log('\nStep 2: Extracting form data...');
    const title = formData.get('title');
    const category = formData.get('category');
    const condition = formData.get('condition');
    const price = formData.get('price');
    const donationRaw = formData.get('donation');
  const isDonation = donationRaw === 'on' || donationRaw === 'true';
  const size = formData.get('size');
    const ageRange = formData.get('ageRange');
    const location = formData.get('location');
    const sellerName = formData.get('sellerName');
    const status = 'available';
    const description = formData.get('description');

    console.log('Form data:', {
      title,
      category,
      condition,
      price,
      size,
      ageRange,
      location,
      sellerName,
      description
    });

    // Server-side validations
    console.log('\nStep 3: Validating title...');
    const t = (title || '').trim();
    if (!t || t.length < 3 || t.length > 150) {
      console.log('❌ Invalid title');
      redirect('/add-listing?err=invalid_title');
    }
    console.log('✅ Title valid');

    console.log('\nStep 4: Validating seller name...');
    const sName = (sellerName || '').trim();
    if (!sName || sName.length < 2 || sName.length > 100) {
      console.log('❌ Invalid seller name:', sName);
      redirect('/add-listing?err=invalid_seller');
    }
    console.log('✅ Seller name valid:', sName);

    console.log('\nStep 5: Validating category...');
    const allowedCategories = ['clothing', 'toys', 'books', 'gear'];
    if (!allowedCategories.includes(String(category || ''))) {
      console.log('❌ Invalid category:', category);
      redirect('/add-listing?err=invalid_category');
    }
    console.log('✅ Category valid');

    console.log('\nStep 6: Validating condition...');
    const allowedConditions = ['new', 'like-new', 'good', 'fair'];
    if (!allowedConditions.includes(String(condition || ''))) {
      console.log('❌ Invalid condition:', condition);
      redirect('/add-listing?err=invalid_condition');
    }
    console.log('✅ Condition valid');

  let finalPriceRaw = String(price ?? '').trim();
  if (isDonation) {
    finalPriceRaw = '0';
  }

  const finalPriceNum = Number(finalPriceRaw);

  if (!isDonation) {
    if (
      !finalPriceRaw ||
      !Number.isFinite(finalPriceNum) ||
      finalPriceNum < 0
    ) {
      redirect('/add-listing?err=invalid_price');
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(finalPriceRaw)) {
      redirect('/add-listing?err=invalid_price_precision');
    }
  }

    console.log('\nStep 8: Processing files...');
    const rawFiles =
      typeof formData.getAll === 'function'
        ? formData.getAll('image')
        : [formData.get('image')];

    const files = rawFiles.filter(Boolean);
    console.log('Files found:', files.length);

    if (!files.length) {
      console.log('❌ No files');
      redirect('/add-listing?err=missing_file');
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    for (const file of files) {
      if (typeof file === 'string' || !file.arrayBuffer) {
        console.log('❌ Invalid file format');
        redirect('/add-listing?err=missing_file');
      }
      if (typeof file.size === 'number' && file.size > MAX_BYTES) {
        console.log('❌ File too large:', file.size);
        redirect('/add-listing?err=file_too_large');
      }
      if (file.type && !String(file.type).startsWith('image/')) {
        console.log('❌ Invalid file type:', file.type);
        redirect('/add-listing?err=bad_type');
      }
    }
    console.log('✅ Files validated');

    console.log('\nStep 9: Uploading to S3...');
    const imageUrls = [];
    for (const file of files) {
      console.log('  Uploading file:', file.name);
      const { imageUrl } = await uploadImageToS3(file, {
        folder: 'items',
        filenamePrefix: 'item',
      });
      imageUrls.push(imageUrl);
      console.log('  ✅ Uploaded:', imageUrl);
    }

    console.log('\nStep 10: Connecting to database...');
    const { getDb } = await import('@/lib/mongodb');
    const db = await getDb();
    console.log('✅ Database connected');

    console.log('\nStep 11: Creating document...');
    const doc = {
      title: String(title),
      price: isDonation ? 0 : Number(price),
      size: size ? String(size) : '',
      condition: String(condition),
      imageUrls,
      description: description ? String(description) : '',
      sellerName: String(sName),
      category: String(category),
      ageRange: ageRange ? String(ageRange) : '',
      location: location ? String(location) : '',
      status,
      createdAt: new Date(),
      sellerId: new ObjectId(session.user.id),
    };

    console.log('Document:', JSON.stringify(doc, null, 2));

    console.log('\nStep 12: Inserting into database...');
    const result = await db.collection('Listings').insertOne(doc);
    console.log('✅ Inserted! ID:', result.insertedId);

    console.log('\nStep 13: Redirecting to home...');
    redirect('/');
    
  } catch (error) {
    console.error('\n❌ ERROR in uploadListingAction:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}