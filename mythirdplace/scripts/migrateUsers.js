const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add this
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mythirdplace-b5bc3'
});

const auth = admin.auth();
const db = admin.firestore();

// User data from the old platform
const oldUsers = [
  { username: 'matt.stebbings', email: 'matt.stebbings@suffolkfa.com', displayName: 'matt.stebbings', registerDate: '2024-09-17 20:01:32' },
  { username: 'Itsphhil', email: 'Itsphhil@gmail.com', displayName: 'Itsphhil', registerDate: '2024-09-18 14:04:17' },
  { username: 'shana.taube', email: 'shana.taube@gmail.com', displayName: 'Shay', registerDate: '2024-09-18 22:13:14' },
  { username: 'maximilianjggrainger', email: 'maximilianjggrainger@gmail.com', displayName: 'maximilianjggrainger', registerDate: '2024-09-20 19:12:07' },
  { username: 'Saheemkever', email: 'Saheemkever@gmail.com', displayName: 'Saheem', registerDate: '2024-09-21 01:08:53' },
  { username: 'abdulali261295', email: 'abdulali261295@googlemail.com', displayName: 'Abdul', registerDate: '2024-09-24 10:50:14' },
  { username: 'gee953', email: 'gee953@hotmail.com', displayName: 'Dan', registerDate: '2024-09-25 15:44:46' },
  { username: 'nick.baird42', email: 'nick.baird42@gmail.com', displayName: 'Nick', registerDate: '2024-09-26 10:07:18' },
  { username: 'kerryr143', email: 'kerryr143@gmail.com', displayName: 'kerryr143', registerDate: '2024-09-28 23:29:22' },
  { username: 'wa.galante', email: 'wa.galante@gmail.com', displayName: 'William', registerDate: '2024-09-30 16:20:22' },
  { username: 'bryonymay161', email: 'bryonymay161@hotmail.com', displayName: 'Bryony', registerDate: '2024-10-01 09:32:35' },
  { username: 'hello', email: 'hello@alyssawiens.com', displayName: 'Alyssa', registerDate: '2024-10-01 21:10:35' },
  { username: 'hollymjackson', email: 'hollymjackson@hotmail.co.uk', displayName: 'Holly Marie', registerDate: '2024-10-02 11:26:42' },
  { username: 'juliet161', email: 'juliet161@sky.com', displayName: 'juliet161', registerDate: '2024-10-05 08:55:15' },
  { username: 'lucyisabellasiegel', email: 'lucyisabellasiegel@gmail.com', displayName: 'Lucy', registerDate: '2024-10-05 19:22:52' },
  { username: 'hayleydavinson683', email: 'hayleydavinson683@gmail.com', displayName: 'Hayley', registerDate: '2024-10-10 11:14:42' },
  { username: 'adam.england', email: 'adam.england@outlook.com', displayName: 'Adam', registerDate: '2024-10-15 10:10:27' },
  { username: 'lucalloyd96', email: 'lucalloyd96@gmail.com', displayName: 'lucalloyd96', registerDate: '2024-10-16 12:44:08' },
  { username: 'fasano.mara', email: 'fasano.mara@gmail.com', displayName: 'Mara', registerDate: '2024-10-23 12:24:15' },
  { username: 'Manthila.gallassage1', email: 'Manthila.gallassage1@gmail.com', displayName: 'Manthi', registerDate: '2024-10-23 20:46:37' },
  { username: 'james.thorogood', email: 'james.thorogood@hotmail.com', displayName: 'James', registerDate: '2024-10-24 12:38:05' },
  { username: 'thorogoodcreative', email: 'thorogoodcreative@gmail.com', displayName: 'James', registerDate: '2024-10-24 22:39:23' },
  { username: 'guy', email: 'guy@guyellis.com', displayName: 'guy', registerDate: '2024-10-25 16:22:54' },
  { username: 'olvaughan96', email: 'olvaughan96@outlook.com', displayName: 'olvaughan96', registerDate: '2024-10-25 21:47:19' },
  { username: 'isabella.slyman', email: 'isabella.slyman@gmail.com', displayName: 'isabella.slyman', registerDate: '2024-10-28 15:48:59' },
  { username: 'info', email: 'info@disabilitywriter.com', displayName: 'info', registerDate: '2024-10-29 14:19:57' },
  { username: 'bmj.yorston', email: 'bmj.yorston@gmail.com', displayName: 'bmj.yorston', registerDate: '2024-11-01 19:06:10' },
  { username: 'charlie', email: 'charlie@aztec.media', displayName: 'charlie', registerDate: '2024-11-03 14:23:50' },
  { username: 'oliverjbuchan', email: 'oliverjbuchan@hotmail.com', displayName: 'Ollie', registerDate: '2024-11-07 09:54:25' },
  { username: 'daniellewisjohn', email: 'daniellewisjohn@gmail.com', displayName: 'Daniel', registerDate: '2024-11-07 13:05:46' },
  { username: 'charlielfisher', email: 'charlielfisher@hotmail.com', displayName: 'charlielfisher', registerDate: '2024-11-07 19:15:19' },
  { username: 'listing', email: 'listing@devops-engineering.co.uk', displayName: 'listing', registerDate: '2024-11-16 14:19:49' },
  { username: 'kelinda', email: 'kelinda@hotmail.co.uk', displayName: 'kelinda', registerDate: '2024-12-08 18:09:22' },
  { username: 'alison.bybee', email: 'alison.bybee@gmail.com', displayName: 'alison.bybee', registerDate: '2024-12-17 21:00:06' },
  { username: 'luketyler91', email: 'luketyler91@gmail.com', displayName: 'luketyler91', registerDate: '2024-12-18 13:08:54' },
  { username: 'steve.rohan', email: 'steve.rohan@outlook.com', displayName: 'steve.rohan', registerDate: '2024-12-28 12:43:20' },
  { username: 'steve.macdouell', email: 'steve.macdouell@gmail.com', displayName: 'Steve', registerDate: '2025-01-03 18:47:02' },
  { username: 'charlottej.2226', email: 'charlottej.2226@gmail.com', displayName: 'Charlotte', registerDate: '2025-01-07 15:25:48' },
  { username: 'cameron', email: 'cameron@thedharmabum.blog', displayName: 'cameron', registerDate: '2025-02-13 17:46:40' },
  { username: 'labourleader', email: 'labourleader@gmail.com', displayName: 'Steve', registerDate: '2025-02-21 11:23:45' },
  { username: 'saraforce', email: 'saraforce@blueyonder.co.uk', displayName: 'saraforce', registerDate: '2025-02-27 06:21:21' },
  { username: 'hannah', email: 'hannah@joymarketing.co.uk', displayName: 'Hannah', registerDate: '2025-03-13 11:29:50' },
  { username: 'nicola', email: 'nicola@nrthrnbaby.com', displayName: 'Nicola', registerDate: '2025-03-13 11:37:58' },
  { username: 'hen.saunders', email: 'hen.saunders@outlook.com', displayName: 'Henrietta', registerDate: '2025-03-16 10:06:01' },
  { username: 'charlie1', email: 'charlie@yeomedia.group', displayName: 'charlie1', registerDate: '2025-03-18 14:13:38' },
  { username: 'joshiechan', email: 'joshiechan@outlook.com', displayName: 'joshiechan', registerDate: '2025-04-12 09:08:02' },
  { username: 'l.whelan007', email: 'l.whelan007@gmail.com', displayName: 'L', registerDate: '2025-04-12 12:35:59' },
  { username: 'laurenstoneweddings', email: 'laurenstoneweddings@gmail.com', displayName: 'Lauren', registerDate: '2025-04-12 23:08:45' },
  { username: 'michael_leach', email: 'michael_leach@rogers.com', displayName: 'michael_leach', registerDate: '2025-04-17 17:30:44' },
  { username: 'blogdesign99', email: 'blogdesign99@gmail.com', displayName: 'blogdesign99', registerDate: '2025-04-18 05:56:08' },
  { username: 'w.a.raja03', email: 'w.a.raja03@gmail.com', displayName: 'w.a.raja03', registerDate: '2025-04-18 06:19:20' },
  { username: 'kathrynelizabethblack', email: 'kathrynelizabethblack@gmail.com', displayName: 'Kathryn', registerDate: '2025-04-21 11:53:28' },
  { username: 'leighannesainthouse', email: 'leighannesainthouse@gmail.com', displayName: 'leighannesainthouse', registerDate: '2025-04-29 09:18:32' },
  { username: 'sparemim123', email: 'sparemim123@gmail.com', displayName: 'sparemim123', registerDate: '2025-05-02 13:57:39' },
  { username: 'jacksoncordner', email: 'jacksoncordner@gmail.com', displayName: 'jacksoncordner', registerDate: '2025-05-20 18:34:16' },
  { username: 'thomas.n52320', email: 'thomas.n52320@outlook.com', displayName: 'Thomas', registerDate: '2025-05-22 16:02:13' },
  { username: 'alannaalexander.p', email: 'alannaalexander.p@gmail.com', displayName: 'alannaalexander.p', registerDate: '2025-05-24 05:52:20' },
  { username: 'olivier.guiberteau', email: 'olivier.guiberteau@gmail.com', displayName: 'olivier.guiberteau', registerDate: '2025-05-28 07:54:41' },
  { username: 'sarah.brownlee', email: 'sarah.brownlee@hotmail.co.uk', displayName: 'sarah.brownlee', registerDate: '2025-06-01 21:36:32' },
  { username: 'milly', email: 'milly@m-white.co.uk', displayName: 'milly', registerDate: '2025-06-02 13:20:26' },
  { username: 'nickwitts', email: 'nickwitts@icloud.com', displayName: 'Nick', registerDate: '2025-06-05 18:11:47' },
  { username: 'Freddyeskaros.business', email: 'Freddyeskaros.business@gmail.com', displayName: 'Freddyeskaros.business', registerDate: '2025-06-08 16:00:24' },
  { username: 'erinlbel', email: 'erinlbel@icloud.com', displayName: 'erinlbel', registerDate: '2025-06-30 15:23:25' },
  { username: 'featherjess', email: 'featherjess@hotmail.com', displayName: 'featherjess', registerDate: '2025-07-09 00:00:05' },
  { username: 'annie', email: 'annie@thegracenetwork.org.uk', displayName: 'annie', registerDate: '2025-07-09 09:28:24' },
  { username: 'arron', email: 'arron@aztec.media', displayName: 'arron', registerDate: '2025-07-30 09:32:16' },
  { username: 'laurenpenzer03', email: 'laurenpenzer03@gmail.com', displayName: 'Lauren', registerDate: '2025-07-30 13:44:33' },
  { username: 'mariannejarvis', email: 'mariannejarvis@hotmail.com', displayName: 'mariannejarvis', registerDate: '2025-08-04 16:30:01' },
  { username: 'a.longhurst38', email: 'a.longhurst38@gmail.com', displayName: 'Alice', registerDate: '2025-08-05 13:54:03' },
  { username: 'ellie.knight72', email: 'ellie.knight72@gmail.com', displayName: 'Ellie', registerDate: '2025-08-05 16:48:59' },
  { username: 'curtisbennett', email: 'curtisbennett@live.co.uk', displayName: 'curtisbennett', registerDate: '2025-08-05 22:51:23' },
  { username: 'han.elizabethwilliams', email: 'han.elizabethwilliams@gmail.com', displayName: 'han.elizabethwilliams', registerDate: '2025-08-09 11:55:53' },
  { username: 'graykatherine11', email: 'graykatherine11@gmail.com', displayName: 'graykatherine11', registerDate: '2025-08-14 06:18:21' },
  { username: 'kate', email: 'kate@sunflowercopywriting.co.uk', displayName: 'Kate', registerDate: '2025-08-14 06:41:03' },
  { username: 'tomkeer225', email: 'tomkeer225@gmail.com', displayName: 'Tom', registerDate: '2025-08-16 10:16:15' },
  { username: 'brycelncstr', email: 'brycelncstr@gmail.com', displayName: 'Bryce', registerDate: '2025-08-27 18:14:53' },
  { username: 'gsavina921', email: 'gsavina921@gmail.com', displayName: 'gsavina921', registerDate: '2025-08-29 17:39:02' },
  { username: 'lamija.writing', email: 'lamija.writing@gmail.com', displayName: 'Lamija', registerDate: '2025-09-15 20:43:18' },
  { username: 'amandakellyc22', email: 'amandakellyc22@gmail.com', displayName: 'amandakellyc22', registerDate: '2025-09-19 02:46:38' },
  { username: 'jirah.mickle', email: 'jirah@jirahnicole.com', displayName: 'Jirah', registerDate: '2025-09-22 20:15:48' }
];

// Function to generate random password
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Function to create user in Firebase Auth and Firestore
async function createUser(userData) {
  const password = generateRandomPassword();
  const registrationDate = new Date(userData.registerDate);

  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: userData.email,
      password: password,
      displayName: userData.displayName,
      disabled: false,
    });

    console.log(`✅ Created Firebase Auth user: ${userData.email}`);

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      username: userData.username,
      bio: '',
      profilePhotoURL: '',
      linkedinURL: '',
      portfolioURL: '',
      publicEmail: '',
      createdAt: admin.firestore.Timestamp.fromDate(registrationDate),
      isVerified: false,
      badges: ['Supporter'], // Custom gold badge for migrated users
      isMigratedUser: true, // Flag to identify migrated users
      migrationDate: admin.firestore.Timestamp.now()
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log(`✅ Created Firestore profile: ${userData.email}`);

    return {
      email: userData.email,
      password: password,
      uid: userRecord.uid,
      displayName: userData.displayName,
      username: userData.username
    };

  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    return null;
  }
}

// Main migration function
async function migrateUsers() {
  console.log(`🚀 Starting migration of ${oldUsers.length} users...`);

  const migratedUsers = [];
  const emailPasswordList = [];

  // Process users in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < oldUsers.length; i += batchSize) {
    const batch = oldUsers.slice(i, i + batchSize);

    console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(oldUsers.length/batchSize)}`);

    const promises = batch.map(userData => createUser(userData));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        migratedUsers.push(result.value);
        emailPasswordList.push({
          email: result.value.email,
          password: result.value.password,
          displayName: result.value.displayName,
          username: result.value.username
        });
      }
    });

    // Wait a bit between batches
    if (i + batchSize < oldUsers.length) {
      console.log('⏳ Waiting before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Create email list for client distribution
  const emailListContent = `MyThirdPlace Platform - User Migration Credentials
Generated on: ${new Date().toISOString()}

Total Users Migrated: ${emailPasswordList.length}

EMAIL LIST WITH CREDENTIALS:
============================

${emailPasswordList.map(user => `
Email: ${user.email}
Username: ${user.username}
Display Name: ${user.displayName}
Temporary Password: ${user.password}
Badge: Supporter (Gold)
---`).join('\n')}

INSTRUCTIONS FOR USERS:
======================
1. Use the email and temporary password above to log in
2. You will be prompted to change your password on first login
3. Your account has been migrated with all original registration dates
4. You have been awarded a special "Supporter" badge as a thanks for being an early user
5. Please complete your profile with bio, profile photo, and any additional information

NEXT STEPS:
===========
- Send individual emails to each user with their credentials
- Include welcome message and platform tour
- Provide support contact for any login issues
`;

  // Save the email list
  fs.writeFileSync('./migrated_users_credentials.txt', emailListContent);

  // Also create a CSV for easier distribution
  const csvContent = `Email,Username,DisplayName,TemporaryPassword,Badge\n${emailPasswordList.map(user =>
    `${user.email},${user.username},${user.displayName},${user.password},Supporter`
  ).join('\n')}`;

  fs.writeFileSync('./migrated_users_credentials.csv', csvContent);

  console.log(`\n🎉 Migration completed!`);
  console.log(`✅ Successfully migrated: ${migratedUsers.length} users`);
  console.log(`❌ Failed: ${oldUsers.length - migratedUsers.length} users`);
  console.log(`📧 Email credentials saved to: migrated_users_credentials.txt`);
  console.log(`📊 CSV file saved to: migrated_users_credentials.csv`);

  return migratedUsers;
}

// Add custom claims for badge system (run this after user creation)
async function addCustomClaims() {
  console.log('🏅 Setting up custom badge claims...');

  try {
    // Get all migrated users
    const usersSnapshot = await db.collection('users').where('isMigratedUser', '==', true).get();

    const promises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      await auth.setCustomUserClaims(doc.id, {
        badges: ['Supporter'],
        isMigratedUser: true
      });
      console.log(`✅ Added custom claims for: ${userData.email}`);
    });

    await Promise.all(promises);
    console.log('🎉 Custom claims setup completed!');

  } catch (error) {
    console.error('❌ Error setting up custom claims:', error);
  }
}

// Run the migration
if (require.main === module) {
  migrateUsers()
    .then(() => addCustomClaims())
    .then(() => {
      console.log('🏁 All migration tasks completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateUsers, addCustomClaims };