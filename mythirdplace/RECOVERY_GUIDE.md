# Firebase Storage Recovery Guide

## What Happened

The rename script encountered files without file extensions (profile photos stored as `userId_1000x1000` without `.jpg`). The regex pattern `/_1000x1000(\.\w+)$/` only matches files WITH extensions, so for files without extensions:
- Old name: `profile-photos/2Aqf7HZKuReQln7hGyQStsohHI52_1000x1000`
- New name: `profile-photos/2Aqf7HZKuReQln7hGyQStsohHI52_1000x1000` (same!)

When the script tried to copy the file to itself, then delete it, the file was lost.

## Affected Files

Based on `rename-results-1760469673445.json`, the following folders were affected:
- **profile-photos**: ~19 user profile photos
- **portfolios**: (check results file for count)

## Recovery Options

### Option 1: Browser Cache Recovery (Most Likely to Work)

If you or users recently viewed profiles, the images may still be cached:

1. **Chrome Cache Location**:
   - Windows: `C:\Users\[Username]\AppData\Local\Google\Chrome\User Data\Default\Cache`
   - Mac: `~/Library/Caches/Google/Chrome/Default/Cache`

2. **Find cached images**:
   - Search for files modified around the time users last visited
   - Look for image files that match the Firebase Storage URL pattern
   - Use tools like ChromeCacheView (Windows) or Chrome Cache Viewer (Mac)

3. **Extract images**:
   - Copy cached image files to a recovery folder
   - Rename them to match the original Firebase paths

### Option 2: Local Backup Recovery

If you have any local backups:
1. Check your computer's downloads folder
2. Check any development/testing folders
3. Check your browser's download history for when images were uploaded

### Option 3: User Re-upload

Create a banner on the site asking affected users to re-upload:
```javascript
// Add this to your app to notify affected users
const affectedUsers = [
  '2Aqf7HZKuReQln7hGyQStsohHI52',
  'AthHkDN5dnbuBoANNrh4OrQkZXY2',
  // ... add all affected user IDs from results file
];

if (currentUser && affectedUsers.includes(currentUser.uid)) {
  showNotification('Please re-upload your profile photo');
}
```

### Option 4: Firebase Support

While unlikely to help without backups enabled, you can try:
1. Contact Firebase Support
2. Explain the situation
3. Request if any temporary backups exist

## Prevention for Future

### 1. Enable Firebase Storage Backups

Go to Firebase Console → Storage → Settings → Enable daily backups

### 2. Always Use --dry-run First

ALWAYS test with dry-run flag before running any batch operations:
```bash
node scripts/renameImages.js --dry-run
```

### 3. Use Specific Folders

Target specific folders instead of all files:
```bash
node scripts/renameImages.js --folder=venues --dry-run
node scripts/renameImages.js --folder=blog-images --dry-run
```

### 4. Create Manual Backups

Before running batch operations, export file list:
```bash
node scripts/backupFileList.js
```

## Immediate Actions

1. **Check `rename-results-1760469673445.json`** to see exactly which files were affected
2. **Extract affected user IDs** from the results
3. **Search browser caches** for any cached copies
4. **Check local folders** for any copies
5. **Prepare user notification** for re-upload request

## Script Fix for Future

I'll create a fixed version of the rename script that:
- Handles files without extensions properly
- Adds additional safety checks
- Creates backups before deleting

## List of Affected Users

Extract user IDs from the results file where old === new:
```bash
node scripts/extractAffectedUsers.js
```

This will create a list of user IDs who need to re-upload their profile photos.
