/**
 * Social Media URL Processing Service
 * Handles validation and processing of social media URLs/handles
 */

export const socialMediaPatterns = {
  instagram: {
    handlePattern: /^@?([a-zA-Z0-9_.]){1,30}$/,
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/,
    baseUrl: 'https://instagram.com/'
  },
  facebook: {
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/([a-zA-Z0-9.]+)\/?$/,
    baseUrl: 'https://facebook.com/'
  },
  linkedin: {
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)\/?$/,
    baseUrl: 'https://linkedin.com/company/'
  },
  twitter: {
    handlePattern: /^@?([a-zA-Z0-9_]){1,15}$/,
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/,
    baseUrl: 'https://x.com/'
  },
  tiktok: {
    handlePattern: /^@?([a-zA-Z0-9_.]){1,24}$/,
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?$/,
    baseUrl: 'https://tiktok.com/@'
  }
};

/**
 * Process Instagram handle or URL
 * @param {string} input - Instagram handle or URL
 * @returns {string|null} - Processed URL or null if invalid
 */
export const processInstagramHandle = (input) => {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Accept any URL format - just ensure it has http/https
  if (trimmed.includes('://')) {
    return trimmed;
  }
  
  // If it starts with @, assume it's a handle and try to format it
  if (trimmed.startsWith('@')) {
    const cleanHandle = trimmed.replace(/^@/, '');
    return `${socialMediaPatterns.instagram.baseUrl}${cleanHandle}`;
  }
  
  // Otherwise, assume it's a URL without protocol
  return `https://${trimmed}`;
};

/**
 * Process Facebook URL
 * @param {string} input - Facebook URL
 * @returns {string|null} - Processed URL or null if invalid
 */
export const processFacebookURL = (input) => {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Accept any URL format - just ensure it has http/https
  if (trimmed.includes('://')) {
    return trimmed;
  }
  
  // Otherwise, assume it's a URL without protocol
  return `https://${trimmed}`;
};

/**
 * Process LinkedIn URL
 * @param {string} input - LinkedIn URL
 * @returns {string|null} - Processed URL or null if invalid
 */
export const processLinkedInURL = (input) => {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Accept any URL format - just ensure it has http/https
  if (trimmed.includes('://')) {
    return trimmed;
  }
  
  // Otherwise, assume it's a URL without protocol
  return `https://${trimmed}`;
};

/**
 * Process Twitter/X handle or URL
 * @param {string} input - Twitter handle or URL
 * @returns {string|null} - Processed URL or null if invalid
 */
export const processTwitterHandle = (input) => {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Accept any URL format - just ensure it has http/https
  if (trimmed.includes('://')) {
    return trimmed;
  }
  
  // If it starts with @, assume it's a handle and try to format it
  if (trimmed.startsWith('@')) {
    const cleanHandle = trimmed.replace(/^@/, '');
    return `${socialMediaPatterns.twitter.baseUrl}${cleanHandle}`;
  }
  
  // Otherwise, assume it's a URL without protocol
  return `https://${trimmed}`;
};

/**
 * Process TikTok handle or URL
 * @param {string} input - TikTok handle or URL
 * @returns {string|null} - Processed URL or null if invalid
 */
export const processTikTokHandle = (input) => {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Accept any URL format - just ensure it has http/https
  if (trimmed.includes('://')) {
    return trimmed;
  }
  
  // If it starts with @, assume it's a handle and try to format it
  if (trimmed.startsWith('@')) {
    const cleanHandle = trimmed.replace(/^@/, '');
    return `${socialMediaPatterns.tiktok.baseUrl}${cleanHandle}`;
  }
  
  // Otherwise, assume it's a URL without protocol
  return `https://${trimmed}`;
};

/**
 * Validate social media URL for a specific platform
 * @param {string} platform - Social media platform
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const validateSocialMediaURL = (platform, url) => {
  // Always return true - we now accept any URL format
  return true;
};

/**
 * Process all social media links in an object
 * @param {Object} socialMediaData - Object with social media platform keys and values
 * @returns {Object} - Processed social media data with valid URLs
 */
export const processAllSocialMediaLinks = (socialMediaData) => {
  if (!socialMediaData || typeof socialMediaData !== 'object') {
    return {};
  }
  
  const processed = {};
  const processors = {
    instagram: processInstagramHandle,
    facebook: processFacebookURL,
    linkedin: processLinkedInURL,
    twitter: processTwitterHandle,
    tiktok: processTikTokHandle
  };
  
  Object.entries(socialMediaData).forEach(([platform, value]) => {
    if (value && value.trim() && processors[platform]) {
      const processedUrl = processors[platform](value.trim());
      if (processedUrl) {
        processed[platform] = processedUrl;
      }
    }
  });
  
  return processed;
};

/**
 * Validate all social media links and return validation errors
 * @param {Object} socialMediaData - Object with social media platform keys and values
 * @returns {Object} - Object with validation errors (empty if all valid)
 */
export const validateSocialMediaData = (socialMediaData) => {
  // No validation errors - we now accept any URL format
  return {};
};

/**
 * Get the appropriate FontAwesome icon for a social media platform
 * @param {string} platform - Social media platform
 * @returns {string} - FontAwesome icon class name
 */
export const getSocialMediaIcon = (platform) => {
  const icons = {
    instagram: 'fa-instagram',
    facebook: 'fa-facebook-f',
    linkedin: 'fa-linkedin-in',
    twitter: 'fa-twitter',
    tiktok: 'fa-tiktok'
  };

  return icons[platform] || 'fa-link';
};

/**
 * Get display name for social media platform
 * @param {string} platform - Social media platform key
 * @returns {string} - Display name
 */
export const getSocialMediaDisplayName = (platform) => {
  const names = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
    tiktok: 'TikTok'
  };
  
  return names[platform] || platform;
};

/**
 * Extract username/handle from a processed social media URL
 * @param {string} platform - Social media platform
 * @param {string} url - Processed URL
 * @returns {string|null} - Extracted username or null
 */
export const extractUsernameFromURL = (platform, url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const patterns = {
      instagram: /instagram\.com\/([a-zA-Z0-9_.]+)/,
      facebook: /facebook\.com\/([a-zA-Z0-9.]+)/,
      linkedin: /linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)/,
      twitter: /(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/,
      tiktok: /tiktok\.com\/@([a-zA-Z0-9_.]+)/
    };
    
    const pattern = patterns[platform];
    if (!pattern) return null;
    
    const match = url.match(pattern);
    if (match) {
      return platform === 'linkedin' ? match[2] : match[match.length - 1];
    }
  } catch (error) {
    console.error('Error extracting username:', error);
  }
  
  return null;
};