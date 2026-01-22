/**
 * Batch Image Rename Script
 *
 * This script renames all images in Firebase Storage by removing the _1000x1000 suffix
 * that was added by the Firebase Resize Images extension.
 *
 * Usage:
 *   node scripts/renameImages.js --dry-run       (test without making changes)
 *   node scripts/renameImages.js                 (actually rename files)
 *   node scripts/renameImages.js --folder=venues (only rename files in venues folder)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if we have a service account key
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: serviceAccountKey.json not found!');
  console.error('Please download your Firebase service account key and save it as serviceAccountKey.json');
  console.error('Get it from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);

// Try to get storage bucket from environment or use default
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ||
                      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
                      `${serviceAccount.project_id}.appspot.com`;

console.log('Using storage bucket:', storageBucket);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storageBucket
});

const bucket = admin.storage().bucket();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const folderArg = args.find(arg => arg.startsWith('--folder='));
const folder = folderArg ? folderArg.split('=')[1] : '';

console.log('🔧 Firebase Image Rename Script');
console.log('================================');
console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (files will be renamed)'}`);
console.log(`Folder: ${folder || 'ALL FILES'}`);
console.log('');

async function renameImages() {
  try {
    console.log('📂 Fetching files from Firebase Storage...');

    const [files] = await bucket.getFiles({ prefix: folder });

    console.log(`Found ${files.length} files total\n`);

    const stats = {
      total: files.length,
      renamed: 0,
      skipped: 0,
      errors: 0,
      files: []
    };

    for (const file of files) {
      const filePath = file.name;

      // Skip if doesn't have _1000x1000 suffix
      if (!filePath.includes('_1000x1000')) {
        stats.skipped++;
        continue;
      }

      // Generate new filename by removing _1000x1000 but keeping the extension
      const newFilePath = filePath.replace(/_1000x1000(\.\w+)$/, '$1');

      console.log(`${dryRun ? '🔍 Would rename:' : '✏️  Renaming:'}`);
      console.log(`  FROM: ${filePath}`);
      console.log(`  TO:   ${newFilePath}`);

      if (!dryRun) {
        try {
          // Copy file to new location
          await file.copy(newFilePath);

          // Delete old file
          await file.delete();

          console.log(`  ✅ Success!\n`);
          stats.renamed++;
          stats.files.push({
            old: filePath,
            new: newFilePath,
            status: 'renamed'
          });
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}\n`);
          stats.errors++;
          stats.files.push({
            old: filePath,
            new: newFilePath,
            error: error.message,
            status: 'error'
          });
        }
      } else {
        stats.renamed++;
        stats.files.push({
          old: filePath,
          new: newFilePath,
          status: 'would rename'
        });
        console.log('');
      }
    }

    // Print summary
    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`Total files scanned: ${stats.total}`);
    console.log(`${dryRun ? 'Would rename' : 'Renamed'}: ${stats.renamed}`);
    console.log(`Skipped (no _1000x1000 suffix): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);

    // Save results to file
    const resultsPath = path.join(__dirname, '..', `rename-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(stats, null, 2));
    console.log(`\n💾 Full results saved to: ${resultsPath}`);

    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN. No files were actually renamed.');
      console.log('To actually rename files, run: node scripts/renameImages.js');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
renameImages()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
