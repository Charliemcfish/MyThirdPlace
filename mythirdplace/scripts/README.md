# Test Data Generation Script

This script generates realistic test data for the MyThirdPlace platform, creating users with avatars and venues with random locations across England.

## What it creates

### Users (20 accounts)
- **Names**: Realistic first and last names
- **Emails**: `testuser1@mythirdplace.test` through `testuser20@mythirdplace.test`
- **Passwords**: All accounts use `TestPassword123!`
- **Avatars**: Generated from UI Avatars CDN with name initials
- **Profiles**: Includes bios, optional LinkedIn/portfolio links, and public email settings
- **Verification**: 20% chance of being verified users

### Venues (20 listings)
- **Names**: Community-focused venue names like "The Cozy Corner", "Riverside Retreat"
- **Locations**: Random addresses across 20 English cities (London, Manchester, Birmingham, etc.)
- **Categories**: Cafes, libraries, gyms, saunas, community centers, etc.
- **Images**: 3 placeholder images per venue from Unsplash
- **Details**: Contact info, tags, social media (randomly generated)
- **Relationships**: Each user creates one venue, with random owner/creator status

### Additional Data
- **User-Venue Relationships**: Creator relationships for all venues
- **Regular Status**: 30% chance users become "regulars" at venues
- **Geographic Distribution**: Venues spread across England with realistic coordinates
- **Realistic Details**: Phone numbers, websites, social media handles

## How to run

### Prerequisites
1. Ensure Firebase is configured in your project
2. Make sure your `.env` file has the correct Firebase configuration
3. Have Node.js installed

### Running the script

```bash
# From the project root directory
npm run generate-test-data
```

Or directly with Node:

```bash
node scripts/generateTestData.mjs
```

## What you'll see

The script provides detailed console output:
- ✅ Successfully created items
- ❌ Any errors encountered
- 📊 Final summary with counts

Example output:
```
🚀 Starting test data generation...

Creating test user and venue 1/20...
✅ Created user: Emma Smith (testuser1@mythirdplace.test)
✅ Created venue: The Cozy Corner in London by Emma Smith

Creating test user and venue 2/20...
✅ Created user: Oliver Johnson (testuser2@mythirdplace.test)
✅ Created venue: Riverside Retreat in Manchester by Oliver Johnson

...

🎉 Test data generation complete!
✅ Created 20 users
✅ Created 20 venues
📍 Venues distributed across England
👤 Users have avatars from UI Avatars CDN
🖼️ Venues have placeholder images from Unsplash

Test accounts can be accessed with:
📧 Email: testuser[1-20]@mythirdplace.test
🔑 Password: TestPassword123!
```

## Test Account Access

After running the script, you can log in with any of the generated accounts:

- **Email**: `testuser1@mythirdplace.test` through `testuser20@mythirdplace.test`
- **Password**: `TestPassword123!` (same for all accounts)

## Data Details

### Avatar Generation
- Uses UI Avatars service: `https://ui-avatars.com/api/`
- Green background (#006548) with white text matching brand colors
- Shows user initials in a clean, professional format

### Venue Images
- Sourced from Unsplash with category-appropriate keywords
- 3 high-quality images per venue (800px wide)
- Categories like "coffee-shop", "library", "gym", etc.

### Geographic Coverage
Venues are distributed across these English cities:
- London, Birmingham, Manchester, Liverpool, Leeds
- Sheffield, Bristol, Newcastle, Nottingham, Leicester
- Brighton, Oxford, Cambridge, Bath, York
- Canterbury, Exeter, Chester, Coventry, Plymouth

### Contact Information
- Realistic phone numbers in UK format
- Website URLs based on venue names
- Email addresses using venue domains
- Instagram and Facebook handles

## Cleanup

To remove test data:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Delete the generated documents from:
   - `users` collection
   - `venues` collection  
   - `userVenueRelationships` collection
4. Go to Firebase Authentication
5. Delete the test user accounts

## Troubleshooting

### Common Issues

**"Permission denied" errors**
- Check Firebase security rules allow writes
- Ensure your Firebase config is correct

**"User creation failed" errors**
- Verify Firebase Authentication is enabled
- Check that email/password provider is configured

**"Network error" errors**
- Ensure internet connection is stable
- Check Firebase project is active

**Module import errors**
- Run from project root directory
- Ensure all dependencies are installed with `npm install`

### Rate Limiting
The script includes small delays (100ms) between operations to avoid Firebase rate limits. If you encounter rate limiting, you can increase the delay in the script.

## Customization

You can modify the script to:
- Change the number of users/venues created
- Add different cities or countries
- Modify the venue categories or tags
- Use different image sources
- Adjust the randomization probabilities

Edit the arrays and settings at the top of `generateTestData.mjs` to customize the generated data.