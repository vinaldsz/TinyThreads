'use server';

import { redirect } from 'next/navigation';
import { uploadImageToS3 } from '@/lib/awss3.js';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function uploadListingAction(formData) {
  try {
    // Get the logged-in user
    const session = await getServerSession(authOptions);

    // If not logged in, redirect to login (Next.js will control-flow via exception)
    if (!session?.user?.id) redirect('/login');

    // Extract form values (we ignore client-provided sellerName for storage)
    const title = formData.get('title');
    const category = formData.get('category');
    const condition = formData.get('condition');
    const price = formData.get('price');
    const donationRaw = formData.get('donation');
    const isDonation = donationRaw === 'on' || donationRaw === 'true';
    const size = formData.get('size');
    const ageRange = formData.get('ageRange');
    const location = formData.get('location');
    const latStr = formData.get('lat');
    const lngStr = formData.get('lng');
    const lat = latStr ? Number(latStr) : null;
    const lng = lngStr ? Number(lngStr) : null;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    const description = formData.get('description');

    // Server-side validations
    const t = (title || '').trim();
    if (!t || t.length < 3 || t.length > 150)
      redirect('/add-listing?err=invalid_title');

    const sName = (session?.user?.name || '').trim();
    if (!sName || sName.length < 2 || sName.length > 100)
      redirect('/add-listing?err=invalid_seller');

    const allowedCategories = ['clothing', 'toys', 'books', 'gear'];
    if (!allowedCategories.includes(String(category || '')))
      redirect('/add-listing?err=invalid_category');

    const allowedConditions = ['new', 'like-new', 'good', 'fair'];
    if (!allowedConditions.includes(String(condition || '')))
      redirect('/add-listing?err=invalid_condition');

    // Require a human-readable location string
    const loc = (location || '').trim();
    if (!loc) {
      redirect('/add-listing?err=invalid_location');
    }

    // Require valid coordinates so every listing is geolocated
    if (!hasCoords) {
      redirect('/add-listing?err=missing_coords');
    }

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

    const rawFiles =
      typeof formData.getAll === 'function'
        ? formData.getAll('image')
        : [formData.get('image')];
    const files = rawFiles.filter(Boolean);
    if (!files.length) redirect('/add-listing?err=missing_file');

    const MAX_BYTES = 5 * 1024 * 1024;
    for (const file of files) {
      if (typeof file === 'string' || !file.arrayBuffer)
        redirect('/add-listing?err=missing_file');
      if (typeof file.size === 'number' && file.size > MAX_BYTES)
        redirect('/add-listing?err=file_too_large');
      if (file.type && !String(file.type).startsWith('image/'))
        redirect('/add-listing?err=bad_type');
    }

    // Upload files to S3
    const imageUrls = [];
    for (const file of files) {
      const { imageUrl } = await uploadImageToS3(file, {
        folder: 'items',
        filenamePrefix: 'item',
      });
      imageUrls.push(imageUrl);
    }

    // Persist listing
    const { getDb } = await import('@/lib/mongodb');
    const db = await getDb();
    // Lookup user to fetch email for the listing
    let sellerEmail = '';
    try {
      const usersColl = db.collection('users');
      const uid = ObjectId.isValid(session.user.id)
        ? new ObjectId(session.user.id)
        : session.user.id;
      const user = await usersColl.findOne({ _id: uid });
      if (user && user.email) sellerEmail = String(user.email);
    } catch (e) {
      // don't block listing creation if user lookup fails; log and continue
      console.error('Failed to lookup seller email:', e);
    }

    const doc = {
      title: String(title),
      price: isDonation ? 0 : Number(price),
      size: size ? String(size) : '',
      condition: String(condition),
      imageUrls,
      description: description ? String(description) : '',
      // store authoritative seller name from session
      sellerName: String(sName),
      // store seller email fetched from users collection (if available)
      sellerEmail: sellerEmail,
      category: String(category),
      ageRange: ageRange ? String(ageRange) : '',
      location: location ? String(location) : '',
      ...(hasCoords && {
        geoLocation: {
          type: 'Point',
          coordinates: [lng, lat], // IMPORTANT: [longitude, latitude]
        },
      }),
      status: 'available',
      createdAt: new Date(),
      sellerId: new ObjectId(session.user.id),
    };

    await db.collection('Listings').insertOne(doc);

    // On success redirect to home
    redirect('/');
  } catch (error) {
    // Let Next.js handle redirect control-flow without logging it as an error
    if (error && String(error?.message) === 'NEXT_REDIRECT') throw error;

    // Log other errors and rethrow
    console.error('❌ ERROR in uploadListingAction:', error);
    throw error;
  }
}
