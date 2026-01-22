/**
 * Helper script to get recent Instagram post URLs
 * These will be hardcoded into the component
 */

const puppeteer = require('puppeteer');

async function getInstagramPosts() {
  console.log('Note: For the best implementation, we will hardcode recent post URLs.');
  console.log('\nTo get your recent post URLs:');
  console.log('1. Go to https://www.instagram.com/mythirdplaceltd/');
  console.log('2. Click on your 6-9 most recent posts');
  console.log('3. Copy the URLs (they look like: https://www.instagram.com/p/ABC123/)');
  console.log('4. Paste them into the component\n');
  console.log('Alternative: Use the profile widget with captionless posts option');
}

getInstagramPosts();
