/**
 * Test script to validate Instagram API credentials
 */

const ACCESS_TOKEN = 'IGAAJ0SOwLY5NBZAFNzR0FYa3hJQlhhcENfZAXY1NzMwSmR2Y0Niem9KS0hrZADV0cm1SYmxVa2lXSnNxRUxUbFhYNHdIZAFRSNmRPdC1QZAXVUcUx1bWo0b0h3bWtTY3JUNXVUdUE0RjlyeEVnYnUzb2RYTG9ISnZAVTF9pSG5lQVVzawZDZD';
const USER_ID = '17841467028077294';
const INSTAGRAM_API_BASE = 'https://graph.instagram.com';

async function testInstagramAPI() {
  console.log('Testing Instagram API credentials...\n');

  try {
    // Test 1: Validate account access
    console.log('1. Checking account access...');
    const accountUrl = `${INSTAGRAM_API_BASE}/${USER_ID}?fields=id,username&access_token=${ACCESS_TOKEN}`;
    const accountResponse = await fetch(accountUrl);

    if (!accountResponse.ok) {
      const error = await accountResponse.json();
      console.error('❌ Account validation failed:', error);
      console.log('\n⚠️  Your Instagram access token may be expired.');
      console.log('To fix this, you need to refresh your token at:');
      console.log('https://developers.facebook.com/apps/\n');
      return;
    }

    const accountData = await accountResponse.json();
    console.log('✅ Account validated:', accountData.username);

    // Test 2: Fetch recent media
    console.log('\n2. Fetching recent posts...');
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const mediaUrl = `${INSTAGRAM_API_BASE}/${USER_ID}/media?fields=${fields}&access_token=${ACCESS_TOKEN}&limit=9`;
    const mediaResponse = await fetch(mediaUrl);

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      console.error('❌ Media fetch failed:', error);
      return;
    }

    const mediaData = await mediaResponse.json();
    console.log(`✅ Successfully fetched ${mediaData.data.length} posts`);

    // Display post details
    console.log('\n📸 Recent posts:');
    mediaData.data.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.media_type}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   URL: ${post.permalink}`);
      if (post.caption) {
        console.log(`   Caption: ${post.caption.substring(0, 50)}...`);
      }
    });

    console.log('\n✅ Instagram API is working correctly!');
    console.log('Your feed on the homepage will display these posts.\n');

  } catch (error) {
    console.error('❌ Error testing Instagram API:', error.message);
    console.log('\n⚠️  Make sure you have internet connection and the credentials are correct.\n');
  }
}

testInstagramAPI();
