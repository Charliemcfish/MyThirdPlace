// Generate email list for manual distribution (without running Firebase migration)
const fs = require('fs');

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

function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Generate credentials for all users
const userCredentials = oldUsers.map(user => ({
  email: user.email,
  displayName: user.displayName,
  username: user.username,
  password: generateRandomPassword(),
  registerDate: user.registerDate
}));

// Create human-readable format
const humanReadableContent = `MyThirdPlace Platform - User Migration Credentials
Generated on: ${new Date().toISOString()}

Total Users for Migration: ${userCredentials.length}

EMAIL LIST WITH CREDENTIALS:
============================

${userCredentials.map((user, index) => `${index + 1}. ${user.displayName} (${user.username})
   Email: ${user.email}
   Temporary Password: ${user.password}
   Original Registration: ${user.registerDate}
   Badge: Supporter (Gold 🌟)
   ---`).join('\n')}

INSTRUCTIONS FOR CLIENT:
========================
1. Use the main migration script (migrateUsers.js) to create actual Firebase accounts
2. This file is for reference and planning only
3. Send individual emails to each user with their credentials
4. Include welcome message and platform tour information
5. Provide support contact for any login issues

EMAIL TEMPLATE:
===============
Subject: Welcome to the New MyThirdPlace Platform!

Hi [Display Name],

Your account has been successfully migrated to our new MyThirdPlace platform!

Login Details:
Email: [email]
Temporary Password: [password]

🌟 You've been awarded a special "Supporter" badge as a thank you for being an early community member!

Please log in and change your password at your earliest convenience.

Welcome back!
The MyThirdPlace Team
`;

// Create CSV format
const csvContent = `Email,Username,DisplayName,TemporaryPassword,RegisterDate,Badge
${userCredentials.map(user =>
  `"${user.email}","${user.username}","${user.displayName}","${user.password}","${user.registerDate}","Supporter"`
).join('\n')}`;

// Save files
fs.writeFileSync('./user_migration_credentials.txt', humanReadableContent);
fs.writeFileSync('./user_migration_credentials.csv', csvContent);

console.log(`✅ Generated credentials for ${userCredentials.length} users`);
console.log(`📧 Human-readable list saved to: user_migration_credentials.txt`);
console.log(`📊 CSV file saved to: user_migration_credentials.csv`);
console.log(`\n⚠️  IMPORTANT: This is for planning only. Run migrateUsers.js to create actual Firebase accounts.`);