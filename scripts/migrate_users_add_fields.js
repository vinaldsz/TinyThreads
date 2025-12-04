#!/usr/bin/env node
/**
 * scripts/migrate_users_add_fields.js
 *
 * Backfill missing fields on documents in the `users` collection so they match
 * the desired shape. This script is non-destructive: it will only set values
 * where a field is missing (it does not overwrite existing values).
 *
 * Usage:
 *  - Dry run (report only):
 *      MONGODB_URI="..." node ./scripts/migrate_users_add_fields.js --dry-run
 *  - Apply changes:
 *      MONGODB_URI="..." node ./scripts/migrate_users_add_fields.js
 *
 * Requirements:
 *  - Node + ESM (project uses "type": "module")
 *  - MongoDB 4.2+ (updateMany with aggregation pipeline)
 */

import { getDb } from '../src/lib/mongodb.js';

function parseArgs() {
  const args = process.argv.slice(2);
  return { dryRun: args.includes('--dry-run') || args.includes('-n') };
}

async function main() {
  const { dryRun } = parseArgs();
  try {
    const db = await getDb();
    const users = db.collection('users');

    const totalUsers = await users.countDocuments();

    const missingQuery = {
      $or: [
        { displayName: { $exists: false } },
        { avatarUrl: { $exists: false } },
        { bio: { $exists: false } },
        { location: { $exists: false } },
        { updatedAt: { $exists: false } },
        { settings: { $exists: false } },
      ],
    };

    const missingCount = await users.countDocuments(missingQuery);

    console.log(`Total users: ${totalUsers}`);
    console.log(`Users missing one or more target fields: ${missingCount}`);

    const perField = {
      displayName: await users.countDocuments({
        displayName: { $exists: false },
      }),
      avatarUrl: await users.countDocuments({ avatarUrl: { $exists: false } }),
      bio: await users.countDocuments({ bio: { $exists: false } }),
      location: await users.countDocuments({ location: { $exists: false } }),
      updatedAt: await users.countDocuments({ updatedAt: { $exists: false } }),
      settings: await users.countDocuments({ settings: { $exists: false } }),
    };

    console.log('Per-field missing counts:', perField);

    if (dryRun) {
      console.log('Dry run complete — no changes applied.');
      process.exit(0);
    }

    // Aggregation pipeline for updateMany: set defaults only where missing
    const updatePipeline = [
      {
        $set: {
          displayName: { $ifNull: ['$displayName', '$name'] },
          avatarUrl: { $ifNull: ['$avatarUrl', ''] },
          bio: { $ifNull: ['$bio', ''] },
          location: { $ifNull: ['$location', ''] },
          updatedAt: { $ifNull: ['$updatedAt', '$createdAt'] },
          settings: { $ifNull: ['$settings', {}] },
        },
      },
    ];

    console.log(
      'Applying update to users collection (this updates documents missing fields)...',
    );

    const res = await users.updateMany({}, updatePipeline);

    console.log('Update result:', {
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
      acknowledged: res.acknowledged,
    });

    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(2);
  }
}

main();
