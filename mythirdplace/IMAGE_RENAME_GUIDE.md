# Image Rename Fix Guide

## Problem
The Firebase Resize Images extension added `_1000x1000` suffix to all image filenames, breaking image loading on the website.

Example:
- **Old (working)**: `1758830188939_bf4z74qrmy.jpg`
- **Broken**: `1758830188939_bf4z74qrmy_1000x1000.jpg`

## Solution Overview
We've created scripts and Cloud Functions to rename all images by removing the `_1000x1000` suffix.

---

## Quick Fix (Recommended)

### Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded file as `serviceAccountKey.json` in your project root directory

**⚠️ IMPORTANT**: This file contains sensitive credentials. It's already in `.gitignore` so it won't be committed.

### Step 2: Install Dependencies

```bash
# Install Firebase Admin SDK for the scripts
npm install firebase-admin

# Install Cloud Functions dependencies (optional)
cd functions
npm install
cd ..
```

### Step 3: Test the Rename Script (Dry Run)

This will show you what would be renamed **without actually making changes**:

```bash
node scripts/renameImages.js --dry-run
```

Review the output carefully. It will show you:
- Total files found
- Files that will be renamed
- Files that will be skipped (no `_1000x1000` suffix)

### Step 4: Run the Actual Rename

Once you're confident the dry run looks correct:

```bash
node scripts/renameImages.js
```

This will:
- ✅ Rename all files by removing `_1000x1000`
- ✅ Keep original file extensions
- ✅ Save a detailed report to `rename-results-[timestamp].json`

### Step 5: Update Firestore URLs

After renaming the files, update the database references:

```bash
# Test first (dry run)
node scripts/updateFirestoreURLs.js --dry-run

# Then actually update
node scripts/updateFirestoreURLs.js
```

This updates:
- `venues.photos` array
- `venues.primaryPhotoURL`
- `blogs.featuredImageURL`
- `users.profilePhotoURL`

### Step 6: Verify Images Are Loading

1. Clear your browser cache
2. Visit your website
3. Check that images are now loading correctly

---

## Advanced Options

### Rename Files in Specific Folder Only

If you only want to rename files in a specific folder (e.g., just venue images):

```bash
# Dry run for venues only
node scripts/renameImages.js --dry-run --folder=venues

# Actually rename venues only
node scripts/renameImages.js --folder=venues
```

Available folders:
- `venues` - All venue photos
- `blogs/featured` - Blog featured images
- `profile-photos` - User profile photos
- `claims` - Claim verification documents

### Using Cloud Functions (Alternative Method)

If you prefer using Cloud Functions instead of local scripts:

#### 1. Deploy the Functions

```bash
firebase deploy --only functions
```

#### 2. Use the HTTP Endpoint

Visit this URL in your browser to test (dry run):
```
https://[region]-[project-id].cloudfunctions.net/batchRenameImagesHTTP?dryRun=true
```

To actually rename:
```
https://[region]-[project-id].cloudfunctions.net/batchRenameImagesHTTP?dryRun=false
```

Replace `[region]` and `[project-id]` with your Firebase project details.

---

## Troubleshooting

### "serviceAccountKey.json not found"
- Download the service account key from Firebase Console
- Save it as `serviceAccountKey.json` in the project root
- Do NOT commit this file to git

### "Permission denied" errors
- Make sure your service account has Storage Admin permissions
- Check Firebase Console > IAM & Admin > IAM
- Your service account should have "Firebase Admin SDK Administrator Service Agent" role

### Images still not loading after rename
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check the rename results JSON file to verify files were renamed
3. Check Firestore to verify URLs were updated
4. Look at browser console for specific 404 errors
5. Verify the new filenames in Firebase Storage console

### Script runs too slowly
- The script processes files one at a time to avoid rate limits
- For thousands of images, this may take several minutes
- Progress is logged for each file
- Results are saved even if script is interrupted

---

## Preventing Future Issues

### Option 1: Disable the Resize Extension
If the extension is causing problems, you can disable it:

```bash
firebase ext:uninstall resize-images
```

### Option 2: Use the Built-in Compression
We've already implemented image compression in the codebase:
- Images are compressed before upload
- Venue photos: 1200x1200px, 80% quality
- Blog images: 1600x900px, 85% quality
- Profile photos: 400x400px, 85% quality

The extension is no longer needed since we handle compression in code.

---

## Files Created

- `functions/index.js` - Cloud Functions for image renaming
- `functions/package.json` - Functions dependencies
- `scripts/renameImages.js` - Local batch rename script
- `scripts/updateFirestoreURLs.js` - Update database URLs
- `IMAGE_RENAME_GUIDE.md` - This guide

---

## Summary Commands

```bash
# Quick fix (recommended)
node scripts/renameImages.js --dry-run     # 1. Test first
node scripts/renameImages.js               # 2. Rename files
node scripts/updateFirestoreURLs.js        # 3. Update database
```

---

## Need Help?

If you encounter any issues:
1. Check the console output for specific error messages
2. Review the generated JSON results files
3. Check Firebase Console > Storage to verify file changes
4. Check Firebase Console > Firestore to verify URL updates

All operations can be safely tested with `--dry-run` first!
