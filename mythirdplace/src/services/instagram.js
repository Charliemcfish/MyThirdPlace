/**
 * Instagram Basic Display API Service
 * Handles fetching Instagram posts for the homepage feed
 */

const INSTAGRAM_API_BASE = 'https://graph.instagram.com';

/**
 * Get Instagram access token from environment
 * @returns {string|null} Access token or null if not configured
 */
const getAccessToken = () => {
  // Try to get from public env first (for web), then regular env
  return process.env.EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN ||
         process.env.INSTAGRAM_ACCESS_TOKEN ||
         null;
};

/**
 * Get Instagram user ID from environment
 * @returns {string|null} User ID or null if not configured
 */
const getUserId = () => {
  // Try to get from public env first (for web), then regular env
  return process.env.EXPO_PUBLIC_INSTAGRAM_USER_ID ||
         process.env.INSTAGRAM_USER_ID ||
         null;
};

/**
 * Cache for Instagram posts to reduce API calls
 */
let postsCache = {
  data: null,
  timestamp: null,
  expiry: 30 * 60 * 1000 // 30 minutes cache
};

/**
 * Check if cache is valid
 * @returns {boolean} Whether cache is still valid
 */
const isCacheValid = () => {
  if (!postsCache.data || !postsCache.timestamp) {
    return false;
  }
  return Date.now() - postsCache.timestamp < postsCache.expiry;
};

/**
 * Fetch Instagram user's recent media
 * @param {number} limit - Number of posts to fetch (default: 9)
 * @returns {Promise<Array>} Array of Instagram posts
 */
export const fetchInstagramPosts = async (limit = 9) => {
  // Check cache first
  if (isCacheValid() && postsCache.data) {
    console.log('Returning cached Instagram posts');
    return postsCache.data.slice(0, limit);
  }

  const accessToken = getAccessToken();
  const userId = getUserId();

  if (!accessToken || !userId) {
    console.warn('Instagram API credentials not configured');
    throw new Error('Instagram API credentials not configured');
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const url = `${INSTAGRAM_API_BASE}/${userId}/media?fields=${fields}&access_token=${accessToken}&limit=${limit}`;

    console.log('Fetching Instagram posts from API...');
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        console.error('Instagram API Error:', errorData);
        throw new Error(`Instagram API Error: ${errorData.error?.message || 'Bad Request'}`);
      }
      if (response.status === 401) {
        throw new Error('Instagram access token is invalid or expired');
      }
      throw new Error(`Instagram API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Instagram API');
    }

    // Process the posts to ensure we have the right image URLs
    const processedPosts = data.data.map(post => ({
      id: post.id,
      media_type: post.media_type,
      media_url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      permalink: post.permalink,
      caption: post.caption || '',
      timestamp: post.timestamp
    }));

    // Update cache
    postsCache = {
      data: processedPosts,
      timestamp: Date.now()
    };

    console.log(`Successfully fetched ${processedPosts.length} Instagram posts`);
    return processedPosts.slice(0, limit);

  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    throw error;
  }
};

/**
 * Get placeholder Instagram posts for fallback
 * @param {number} count - Number of placeholder posts to generate
 * @returns {Array} Array of placeholder posts
 */
export const getPlaceholderPosts = (count = 9) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder_${index + 1}`,
    media_type: 'IMAGE',
    media_url: `https://picsum.photos/300/300?random=${index + 1}`,
    permalink: 'https://www.instagram.com/mythirdplaceltd/?hl=en',
    caption: 'Follow us for more third place inspiration!',
    timestamp: new Date().toISOString()
  }));
};

/**
 * Get Instagram posts with fallback to placeholder
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} Array of Instagram posts or placeholders
 */
export const getInstagramPostsWithFallback = async (limit = 9) => {
  try {
    return await fetchInstagramPosts(limit);
  } catch (error) {
    console.warn('Failed to fetch Instagram posts, using placeholders:', error.message);
    return getPlaceholderPosts(limit);
  }
};

/**
 * Refresh Instagram access token (for long-lived tokens)
 * @returns {Promise<string>} New access token
 */
export const refreshInstagramToken = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No access token available to refresh');
  }

  try {
    const url = `${INSTAGRAM_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;

  } catch (error) {
    console.error('Error refreshing Instagram token:', error);
    throw error;
  }
};

/**
 * Validate Instagram API credentials
 * @returns {Promise<boolean>} Whether credentials are valid
 */
export const validateInstagramCredentials = async () => {
  const accessToken = getAccessToken();
  const userId = getUserId();

  if (!accessToken || !userId) {
    return false;
  }

  try {
    const url = `${INSTAGRAM_API_BASE}/${userId}?fields=id,username&access_token=${accessToken}`;
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('Error validating Instagram credentials:', error);
    return false;
  }
};

/**
 * Clear Instagram posts cache
 */
export const clearInstagramCache = () => {
  postsCache = {
    data: null,
    timestamp: null,
    expiry: 30 * 60 * 1000
  };
};