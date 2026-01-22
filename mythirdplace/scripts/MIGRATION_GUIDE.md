# User Migration Guide

This guide explains how to migrate users from the old WordPress platform to the new Firebase-based MyThirdPlace platform.

## Prerequisites

1. **Firebase Admin SDK**: You need a service account key file from Firebase Console
2. **Node.js**: Ensure you have Node.js installed
3. **Firebase Admin**: Install Firebase Admin SDK: `npm install firebase-admin`

## Setup

### 1. Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your MyThirdPlace project (`mythirdplace-b5bc3`)
3. Navigate to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `scripts/serviceAccountKey.json`

### 2. Install Dependencies

```bash
cd scripts
npm install firebase-admin
```

## Migration Process

### 1. Run the Migration Script

```bash
node migrateUsers.js
```

This script will:
- Create Firebase Authentication accounts for all 78 users
- Generate random secure passwords for each user
- Create Firestore user profiles with original registration dates
- Add "Supporter" badge to all migrated users
- Generate credential lists for distribution

### 2. Output Files

The script generates two files:

1. **`migrated_users_credentials.txt`** - Human-readable format with instructions
2. **`migrated_users_credentials.csv`** - Spreadsheet-friendly format

## User Profile Structure

Each migrated user gets:

```javascript
{
  uid: "firebase-generated-uid",
  email: "user@example.com",
  displayName: "User Display Name",
  username: "original-username",
  bio: "",
  profilePhotoURL: "",
  linkedinURL: "",
  portfolioURL: "",
  publicEmail: "",
  createdAt: "original-registration-date",
  isVerified: false,
  badges: ["Supporter"], // Special gold badge
  isMigratedUser: true,
  migrationDate: "current-timestamp"
}
```

## Badge System

### Supporter Badge
- **Color**: Gold (#ffd700)
- **Icon**: 🌟
- **Description**: "Early platform supporter"
- **Purpose**: Recognize users who were on the original platform

### Badge Display
Badges appear on user profiles and can be displayed using the Badge component:

```javascript
import { Badge, BadgeList } from '../components/common/Badge';

// Single badge
<Badge badge="Supporter" size="medium" />

// Multiple badges
<BadgeList badges={["Supporter", "Regular"]} maxVisible={3} />
```

## Distribution Instructions

### 1. Individual Email Distribution

Send each user their credentials via email with:
- Login email
- Temporary password
- Instructions to change password on first login
- Welcome message explaining the migration

### 2. Welcome Email Template

```
Subject: Welcome to the New MyThirdPlace Platform!

Hi [Display Name],

Your account has been successfully migrated to our new MyThirdPlace platform! Here are your login details:

Email: [email]
Temporary Password: [password]

🌟 You've been awarded a special "Supporter" badge as a thank you for being an early community member!

Next Steps:
1. Visit [platform-url] and log in with the credentials above
2. You'll be prompted to create a new password
3. Complete your profile with a photo and bio
4. Explore the new features and start connecting with your local third places!

If you have any issues logging in, please contact us at support@mythirdplace.com

Welcome back to the community!
The MyThirdPlace Team
```

## Security Notes

1. **Temporary Passwords**: All passwords are randomly generated and should be changed on first login
2. **Service Account**: Keep the service account key secure and never commit it to version control
3. **Rate Limiting**: The script includes delays to avoid Firebase rate limits
4. **Error Handling**: Failed migrations are logged for manual review

## Troubleshooting

### Common Issues

1. **"Permission denied"**: Check service account permissions
2. **"Rate limit exceeded"**: The script includes delays, but you may need to increase them
3. **"Invalid email"**: Some emails in the source data may be malformed

### Manual Migration

If some users fail to migrate automatically:

1. Check the console output for specific error messages
2. Manually create accounts through Firebase Console
3. Update the Firestore document with the correct badge and migration flag

## Verification

After migration, verify:
1. All users can log in with their temporary passwords
2. Badge system displays correctly
3. Original registration dates are preserved
4. User profiles are properly structured

## Next Steps

1. Send welcome emails to all migrated users
2. Monitor login success rates
3. Provide support for any login issues
4. Consider implementing password reset flow for users who lose their credentials

## Files Structure

```
scripts/
├── migrateUsers.js              # Main migration script
├── serviceAccountKey.json       # Firebase service account (not in git)
├── serviceAccountKey.json.example # Template for service account key
├── migrated_users_credentials.txt # Human-readable credentials
├── migrated_users_credentials.csv # CSV format credentials
└── MIGRATION_GUIDE.md          # This guide
```