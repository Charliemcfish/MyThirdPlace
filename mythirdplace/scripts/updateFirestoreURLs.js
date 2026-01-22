/**
 * Update Firestore URLs Script
 *
 * This script updates all image URLs in Firestore to match the renamed files.
 * It removes _1000x1000 from URLs in:
 * - venues.photos array
 * - venues.primaryPhotoURL
 * - blogs.featuredImageURL
 * - users.profilePhotoURL
 *
 * Usage:
 *   node scripts/updateFirestoreURLs.js --dry-run  (test without making changes)
 *   node scripts/updateFirestoreURLs.js            (actually update documents)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if we have a service account key
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: serviceAccountKey.json not found!');
  console.error('Please download your Firebase service account key and save it as serviceAccountKey.json');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log('🔧 Firestore URL Update Script');
console.log('===============================');
console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (documents will be updated)'}`);
console.log('');

/**
 * Remove _1000x1000 from a URL
 */
function cleanURL(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/_1000x1000(\.\w+)/, '$1');
}

/**
 * Update venue documents
 */
async function updateVenues() {
  console.log('📍 Updating venue documents...');

  const venuesSnapshot = await db.collection('venues').get();
  const stats = { total: 0, updated: 0, skipped: 0 };

  for (const doc of venuesSnapshot.docs) {
    stats.total++;
    const venueData = doc.data();
    let needsUpdate = false;
    const updates = {};

    // Update photos array
    if (venueData.photos && Array.isArray(venueData.photos)) {
      const cleanedPhotos = venueData.photos.map(url => cleanURL(url));
      if (JSON.stringify(cleanedPhotos) !== JSON.stringify(venueData.photos)) {
        updates.photos = cleanedPhotos;
        needsUpdate = true;
      }
    }

    // Update primaryPhotoURL
    if (venueData.primaryPhotoURL) {
      const cleanedPrimaryURL = cleanURL(venueData.primaryPhotoURL);
      if (cleanedPrimaryURL !== venueData.primaryPhotoURL) {
        updates.primaryPhotoURL = cleanedPrimaryURL;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`  ${dryRun ? '🔍 Would update' : '✏️  Updating'} venue: ${venueData.name} (${doc.id})`);

      if (!dryRun) {
        await doc.ref.update(updates);
      }

      stats.updated++;
    } else {
      stats.skipped++;
    }
  }

  console.log(`  ✅ Venues: ${stats.updated} ${dryRun ? 'would be ' : ''}updated, ${stats.skipped} skipped\n`);
  return stats;
}

/**
 * Update blog documents
 */
async function updateBlogs() {
  console.log('📝 Updating blog documents...');

  const blogsSnapshot = await db.collection('blogs').get();
  const stats = { total: 0, updated: 0, skipped: 0 };

  for (const doc of blogsSnapshot.docs) {
    stats.total++;
    const blogData = doc.data();
    let needsUpdate = false;
    const updates = {};

    // Update featuredImageURL
    if (blogData.featuredImageURL) {
      const cleanedURL = cleanURL(blogData.featuredImageURL);
      if (cleanedURL !== blogData.featuredImageURL) {
        updates.featuredImageURL = cleanedURL;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`  ${dryRun ? '🔍 Would update' : '✏️  Updating'} blog: ${blogData.title} (${doc.id})`);

      if (!dryRun) {
        await doc.ref.update(updates);
      }

      stats.updated++;
    } else {
      stats.skipped++;
    }
  }

  console.log(`  ✅ Blogs: ${stats.updated} ${dryRun ? 'would be ' : ''}updated, ${stats.skipped} skipped\n`);
  return stats;
}

/**
 * Update user documents
 */
async function updateUsers() {
  console.log('👤 Updating user documents...');

  const usersSnapshot = await db.collection('users').get();
  const stats = { total: 0, updated: 0, skipped: 0 };

  for (const doc of usersSnapshot.docs) {
    stats.total++;
    const userData = doc.data();
    let needsUpdate = false;
    const updates = {};

    // Update profilePhotoURL
    if (userData.profilePhotoURL) {
      const cleanedURL = cleanURL(userData.profilePhotoURL);
      if (cleanedURL !== userData.profilePhotoURL) {
        updates.profilePhotoURL = cleanedURL;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`  ${dryRun ? '🔍 Would update' : '✏️  Updating'} user: ${userData.displayName} (${doc.id})`);

      if (!dryRun) {
        await doc.ref.update(updates);
      }

      stats.updated++;
    } else {
      stats.skipped++;
    }
  }

  console.log(`  ✅ Users: ${stats.updated} ${dryRun ? 'would be ' : ''}updated, ${stats.skipped} skipped\n`);
  return stats;
}

/**
 * Main function
 */
async function updateAllURLs() {
  try {
    const results = {
      venues: await updateVenues(),
      blogs: await updateBlogs(),
      users: await updateUsers()
    };

    // Print summary
    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`Venues: ${results.venues.updated} ${dryRun ? 'would be ' : ''}updated`);
    console.log(`Blogs: ${results.blogs.updated} ${dryRun ? 'would be ' : ''}updated`);
    console.log(`Users: ${results.users.updated} ${dryRun ? 'would be ' : ''}updated`);
    console.log(`Total: ${results.venues.updated + results.blogs.updated + results.users.updated} ${dryRun ? 'would be ' : ''}updated`);

    // Save results to file
    const resultsPath = path.join(__dirname, '..', `firestore-update-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results saved to: ${resultsPath}`);

    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN. No documents were actually updated.');
      console.log('To actually update documents, run: node scripts/updateFirestoreURLs.js');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateAllURLs()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
