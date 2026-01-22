const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to rename a single image file in Firebase Storage
 * Removes the _1000x1000 suffix from the filename
 *
 * Usage: Can be triggered via HTTP or scheduled
 */
exports.renameImage = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { filePath } = data;

  if (!filePath) {
    throw new functions.https.HttpsError('invalid-argument', 'File path is required');
  }

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new functions.https.HttpsError('not-found', 'File does not exist');
    }

    // Check if file has _1000x1000 pattern
    if (!filePath.includes('_1000x1000')) {
      return { success: false, message: 'File does not have _1000x1000 suffix' };
    }

    // Generate new filename by removing _1000x1000
    const newFilePath = filePath.replace(/_1000x1000(\.\w+)$/, '$1');

    // Copy file to new location
    await file.copy(newFilePath);

    // Delete old file
    await file.delete();

    return {
      success: true,
      oldPath: filePath,
      newPath: newFilePath,
      message: 'File renamed successfully'
    };
  } catch (error) {
    console.error('Error renaming file:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Batch rename all images in a specific folder
 * This can be used to process all images in venues, blogs, or profile-photos folders
 */
exports.batchRenameImages = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes (max for Cloud Functions)
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    // Require authentication and admin privileges
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { folder, dryRun = true } = data;

    try {
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({ prefix: folder || '' });

      const results = {
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
          results.skipped++;
          continue;
        }

        try {
          const newFilePath = filePath.replace(/_1000x1000(\.\w+)$/, '$1');

          if (!dryRun) {
            // Actually rename the file
            await file.copy(newFilePath);
            await file.delete();
          }

          results.renamed++;
          results.files.push({
            old: filePath,
            new: newFilePath,
            status: dryRun ? 'would rename' : 'renamed'
          });
        } catch (error) {
          results.errors++;
          results.files.push({
            old: filePath,
            error: error.message,
            status: 'error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch rename:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * HTTP endpoint version of batch rename for easier testing
 */
exports.batchRenameImagesHTTP = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    const { folder = '', dryRun = 'true' } = req.query;
    const isDryRun = dryRun === 'true';

    try {
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({ prefix: folder });

      const results = {
        total: files.length,
        renamed: 0,
        skipped: 0,
        errors: 0,
        dryRun: isDryRun,
        files: []
      };

      for (const file of files) {
        const filePath = file.name;

        // Skip if doesn't have _1000x1000 suffix
        if (!filePath.includes('_1000x1000')) {
          results.skipped++;
          continue;
        }

        try {
          const newFilePath = filePath.replace(/_1000x1000(\.\w+)$/, '$1');

          if (!isDryRun) {
            await file.copy(newFilePath);
            await file.delete();
          }

          results.renamed++;
          results.files.push({
            old: filePath,
            new: newFilePath,
            status: isDryRun ? 'would rename' : 'renamed'
          });
        } catch (error) {
          results.errors++;
          results.files.push({
            old: filePath,
            error: error.message,
            status: 'error'
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
