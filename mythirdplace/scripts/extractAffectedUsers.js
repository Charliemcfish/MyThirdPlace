/**
 * Extract Affected Users Script
 *
 * This script reads the rename results and extracts a list of user IDs
 * whose files were deleted (where old name === new name)
 */

const fs = require('fs');
const path = require('path');

// Find the most recent rename-results file
const resultsDir = path.join(__dirname, '..');
const files = fs.readdirSync(resultsDir)
  .filter(f => f.startsWith('rename-results-'))
  .sort()
  .reverse();

if (files.length === 0) {
  console.error('No rename-results files found!');
  process.exit(1);
}

const latestResults = files[0];
console.log(`Reading: ${latestResults}\n`);

const resultsPath = path.join(resultsDir, latestResults);
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Track affected users and files
const affectedUsers = new Set();
const affectedPortfolios = [];
const deletedFiles = [];

for (const file of results.files) {
  // If old === new, the file was deleted
  if (file.old === file.new) {
    deletedFiles.push(file);

    // Extract user ID from profile-photos
    if (file.old.startsWith('profile-photos/')) {
      const fileName = file.old.replace('profile-photos/', '');
      const userId = fileName.replace('_1000x1000', '');
      affectedUsers.add(userId);
    }

    // Track portfolio files
    if (file.old.startsWith('portfolios/')) {
      affectedPortfolios.push(file.old);
    }
  }
}

// Print summary
console.log('📊 Affected Files Summary');
console.log('========================\n');
console.log(`Total files deleted: ${deletedFiles.length}`);
console.log(`Profile photos deleted: ${affectedUsers.size}`);
console.log(`Portfolio files deleted: ${affectedPortfolios.length}\n`);

// Print affected user IDs
console.log('👤 Affected User IDs:');
console.log('====================');
const userArray = Array.from(affectedUsers);
userArray.forEach((userId, index) => {
  console.log(`${index + 1}. ${userId}`);
});

// Save to files for easy access
const outputDir = path.join(__dirname, '..');

// Save user IDs as JSON array
const userIdsPath = path.join(outputDir, 'affected-user-ids.json');
fs.writeFileSync(userIdsPath, JSON.stringify(userArray, null, 2));
console.log(`\n💾 Saved user IDs to: ${userIdsPath}`);

// Save user IDs as JavaScript constant
const jsConstant = `// Affected user IDs from image rename script
export const AFFECTED_USER_IDS = ${JSON.stringify(userArray, null, 2)};

// Usage in your app:
// import { AFFECTED_USER_IDS } from './affectedUsers';
// if (AFFECTED_USER_IDS.includes(currentUser.uid)) {
//   showNotification('Please re-upload your profile photo');
// }
`;

const jsPath = path.join(outputDir, 'affectedUsers.js');
fs.writeFileSync(jsPath, jsConstant);
console.log(`💾 Saved JavaScript constant to: ${jsPath}`);

// Save full deleted files list
const deletedFilesPath = path.join(outputDir, 'deleted-files.json');
fs.writeFileSync(deletedFilesPath, JSON.stringify({
  summary: {
    totalDeleted: deletedFiles.length,
    profilePhotos: affectedUsers.size,
    portfolioFiles: affectedPortfolios.length
  },
  affectedUserIds: userArray,
  affectedPortfolios: affectedPortfolios,
  allDeletedFiles: deletedFiles
}, null, 2));
console.log(`💾 Saved complete list to: ${deletedFilesPath}`);

console.log('\n✅ Extraction complete!');
