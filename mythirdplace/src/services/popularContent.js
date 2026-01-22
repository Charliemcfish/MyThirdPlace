import { searchVenuesFromIndex, searchBlogsFromIndex } from './searchIndexing';
import { calculateDistance } from './geocoding';
import { formatRelativeDate } from './content';

/**
 * Popular Content and Recommendation Systems
 * Provides algorithms for identifying trending content, popular venues, and personalized recommendations
 */

/**
 * Get popular venues based on multiple factors
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Popular venues with popularity scores
 */
export const getPopularVenues = async (options = {}) => {
  try {
    const {
      limit = 20,
      timeframe = 'month', // 'day', 'week', 'month', 'all'
      location = null,
      radius = null,
      category = null
    } = options;

    // Get base venue data
    const filters = {
      sortBy: 'popular',
      category: category
    };

    const results = await searchVenuesFromIndex('', filters, limit * 3);

    // Calculate popularity scores
    const scoredVenues = results.map(venue => {
      const popularityScore = calculateVenuePopularityScore(venue, timeframe);
      return {
        ...venue,
        popularityScore,
        popularityReason: determinePopularityReason(venue, popularityScore)
      };
    });

    // Apply location filtering if specified
    let filteredVenues = scoredVenues;
    if (location && radius) {
      filteredVenues = scoredVenues.filter(venue => {
        if (!venue.coordinates) return false;
        const distance = calculateDistance(location, {
          lat: venue.coordinates.latitude || venue.coordinates.lat,
          lng: venue.coordinates.longitude || venue.coordinates.lng
        });
        return distance !== null && distance <= radius;
      });
    }

    // Sort by popularity and return top results
    filteredVenues.sort((a, b) => b.popularityScore - a.popularityScore);

    return filteredVenues.slice(0, limit).map(venue => ({
      ...venue,
      contentType: 'venue',
      recommendationType: 'popular'
    }));
  } catch (error) {
    console.error('Error getting popular venues:', error);
    throw new Error('Failed to get popular venues');
  }
};

/**
 * Get trending venues (recently gaining popularity)
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Trending venues with trend scores
 */
export const getTrendingVenues = async (options = {}) => {
  try {
    const {
      limit = 15,
      timeframe = 'week',
      location = null,
      radius = null
    } = options;

    const filters = { sortBy: 'recent' };
    const results = await searchVenuesFromIndex('', filters, limit * 2);

    // Calculate trending scores
    const trendingVenues = results.map(venue => {
      const trendScore = calculateVenueTrendScore(venue, timeframe);
      return {
        ...venue,
        trendScore,
        trendDirection: determineTrendDirection(venue, timeframe)
      };
    });

    // Apply location filtering
    let filteredVenues = trendingVenues;
    if (location && radius) {
      filteredVenues = trendingVenues.filter(venue => {
        if (!venue.coordinates) return false;
        const distance = calculateDistance(location, {
          lat: venue.coordinates.latitude || venue.coordinates.lat,
          lng: venue.coordinates.longitude || venue.coordinates.lng
        });
        return distance !== null && distance <= radius;
      });
    }

    // Sort by trend score
    filteredVenues.sort((a, b) => b.trendScore - a.trendScore);

    return filteredVenues.slice(0, limit).map(venue => ({
      ...venue,
      contentType: 'venue',
      recommendationType: 'trending'
    }));
  } catch (error) {
    console.error('Error getting trending venues:', error);
    throw new Error('Failed to get trending venues');
  }
};

/**
 * Get popular blogs with engagement metrics
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Popular blogs with popularity scores
 */
export const getPopularBlogs = async (options = {}) => {
  try {
    const {
      limit = 20,
      timeframe = 'month',
      category = null,
      hasVenues = false
    } = options;

    const filters = {
      sortBy: 'popular',
      category: category,
      hasVenues: hasVenues
    };

    const results = await searchBlogsFromIndex('', filters, limit * 2);

    // Calculate popularity scores
    const scoredBlogs = results.map(blog => {
      const popularityScore = calculateBlogPopularityScore(blog, timeframe);
      return {
        ...blog,
        popularityScore,
        engagementMetrics: calculateBlogEngagement(blog),
        formattedPublishDate: formatRelativeDate(blog.publishedAt)
      };
    });

    // Sort by popularity
    scoredBlogs.sort((a, b) => b.popularityScore - a.popularityScore);

    return scoredBlogs.slice(0, limit).map(blog => ({
      ...blog,
      contentType: 'blog',
      recommendationType: 'popular'
    }));
  } catch (error) {
    console.error('Error getting popular blogs:', error);
    throw new Error('Failed to get popular blogs');
  }
};

/**
 * Get trending blogs (recently gaining popularity)
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Trending blogs with trend indicators
 */
export const getTrendingBlogs = async (options = {}) => {
  try {
    const {
      limit = 15,
      timeframe = 'week',
      category = null
    } = options;

    const filters = {
      sortBy: 'recent',
      category: category
    };

    const results = await searchBlogsFromIndex('', filters, limit * 2);

    // Calculate trending scores
    const trendingBlogs = results.map(blog => {
      const trendScore = calculateBlogTrendScore(blog, timeframe);
      return {
        ...blog,
        trendScore,
        velocityIndicator: calculateContentVelocity(blog),
        formattedPublishDate: formatRelativeDate(blog.publishedAt)
      };
    });

    // Sort by trend score
    trendingBlogs.sort((a, b) => b.trendScore - a.trendScore);

    return trendingBlogs.slice(0, limit).map(blog => ({
      ...blog,
      contentType: 'blog',
      recommendationType: 'trending'
    }));
  } catch (error) {
    console.error('Error getting trending blogs:', error);
    throw new Error('Failed to get trending blogs');
  }
};

/**
 * Get personalized recommendations for a user
 * @param {string} userUID - User identifier
 * @param {Object} userPreferences - User preference data
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Personalized recommendations
 */
export const getPersonalizedRecommendations = async (userUID, userPreferences = {}, options = {}) => {
  try {
    const {
      limit = 20,
      includeVenues = true,
      includeBlogs = true,
      location = null
    } = options;

    const recommendations = {
      venues: [],
      blogs: [],
      totalScore: 0,
      personalizationFactors: []
    };

    // Get venue recommendations
    if (includeVenues) {
      const venueRecommendations = await getPersonalizedVenueRecommendations(
        userUID,
        userPreferences,
        { limit: Math.ceil(limit / 2), location }
      );
      recommendations.venues = venueRecommendations;
    }

    // Get blog recommendations
    if (includeBlogs) {
      const blogRecommendations = await getPersonalizedBlogRecommendations(
        userUID,
        userPreferences,
        { limit: Math.ceil(limit / 2) }
      );
      recommendations.blogs = blogRecommendations;
    }

    // Calculate overall recommendation quality
    recommendations.totalScore = calculateRecommendationQuality(recommendations);
    recommendations.personalizationFactors = extractPersonalizationFactors(userPreferences);

    return recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw new Error('Failed to get personalized recommendations');
  }
};

/**
 * Get content recommendations based on a specific venue
 * @param {string} venueId - Venue identifier
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Venue-related recommendations
 */
export const getVenueBasedRecommendations = async (venueId, options = {}) => {
  try {
    const { limit = 10, includeNearby = true, includeSimilar = true } = options;

    const recommendations = {
      similarVenues: [],
      nearbyVenues: [],
      relatedBlogs: [],
      venueDetails: null
    };

    // Get venue details first
    // This would typically fetch from Firestore
    // For now, we'll simulate getting venue data

    // Get similar venues (same category/tags)
    if (includeSimilar) {
      recommendations.similarVenues = await getSimilarVenues(venueId, { limit: limit / 2 });
    }

    // Get nearby venues
    if (includeNearby) {
      recommendations.nearbyVenues = await getNearbyVenues(venueId, { limit: limit / 2 });
    }

    // Get blogs that mention this venue
    recommendations.relatedBlogs = await getBlogsAboutVenue(venueId, { limit });

    return recommendations;
  } catch (error) {
    console.error('Error getting venue-based recommendations:', error);
    throw new Error('Failed to get venue-based recommendations');
  }
};

/**
 * Get content discovery feed for homepage
 * @param {Object} userContext - User context and preferences
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Mixed content feed
 */
export const getDiscoveryFeed = async (userContext = {}, options = {}) => {
  try {
    const { limit = 20, location = null } = options;

    const feedItems = [];

    // Get mix of popular and trending content
    const [popularVenues, trendingVenues, popularBlogs, trendingBlogs] = await Promise.all([
      getPopularVenues({ limit: 5, location, radius: location ? 50 : null }),
      getTrendingVenues({ limit: 3, location, radius: location ? 50 : null }),
      getPopularBlogs({ limit: 5 }),
      getTrendingBlogs({ limit: 3 })
    ]);

    // Interleave content types for variety
    const contentMix = [
      ...popularVenues.map(item => ({ ...item, feedSection: 'popular-venues' })),
      ...popularBlogs.map(item => ({ ...item, feedSection: 'popular-blogs' })),
      ...trendingVenues.map(item => ({ ...item, feedSection: 'trending-venues' })),
      ...trendingBlogs.map(item => ({ ...item, feedSection: 'trending-blogs' }))
    ];

    // Shuffle and limit for discovery
    const shuffledContent = shuffleArray(contentMix);

    return shuffledContent.slice(0, limit).map((item, index) => ({
      ...item,
      feedPosition: index,
      discoveryScore: calculateDiscoveryScore(item, userContext)
    }));
  } catch (error) {
    console.error('Error getting discovery feed:', error);
    throw new Error('Failed to get discovery feed');
  }
};

/**
 * Helper Functions
 */

/**
 * Calculate venue popularity score
 * @param {Object} venue - Venue data
 * @param {string} timeframe - Time period to consider
 * @returns {number} Popularity score
 */
const calculateVenuePopularityScore = (venue, timeframe) => {
  let score = 0;

  // Base score from regular count
  const regularCount = venue.regularCount || 0;
  score += regularCount * 10;

  // Blog mentions boost
  const blogMentions = venue.blogMentions || 0;
  score += blogMentions * 5;

  // Recency factor
  const ageInDays = venue.createdAt ?
    (Date.now() - (venue.createdAt.toMillis?.() || Date.now())) / (1000 * 60 * 60 * 24) :
    365;

  const timeframeDays = getTimeframeDays(timeframe);
  const recencyFactor = Math.max(0.1, 1 - (ageInDays / timeframeDays));
  score *= recencyFactor;

  // Completeness bonus
  if (venue.photos && venue.photos.length > 0) score += 5;
  if (venue.description && venue.description.length > 50) score += 3;
  if (venue.tags && venue.tags.length > 0) score += 2;

  return Math.round(score);
};

/**
 * Calculate venue trend score
 * @param {Object} venue - Venue data
 * @param {string} timeframe - Time period to consider
 * @returns {number} Trend score
 */
const calculateVenueTrendScore = (venue, timeframe) => {
  let score = 0;

  // Recent activity weight
  const ageInDays = venue.createdAt ?
    (Date.now() - (venue.createdAt.toMillis?.() || Date.now())) / (1000 * 60 * 60 * 24) :
    365;

  if (ageInDays <= 7) score += 20;      // Very recent
  else if (ageInDays <= 30) score += 10; // Recent
  else if (ageInDays <= 90) score += 5;  // Somewhat recent

  // Growth indicators (simulated)
  const regularGrowth = Math.random() * 10; // Would calculate actual growth
  score += regularGrowth;

  // Blog mention velocity
  const blogVelocity = Math.random() * 5; // Would calculate actual velocity
  score += blogVelocity;

  return Math.round(score);
};

/**
 * Calculate blog popularity score
 * @param {Object} blog - Blog data
 * @param {string} timeframe - Time period to consider
 * @returns {number} Popularity score
 */
const calculateBlogPopularityScore = (blog, timeframe) => {
  let score = 0;

  // View count weight
  const viewCount = blog.viewCount || 0;
  score += viewCount * 0.5;

  // Venue connections
  const venueConnections = blog.linkedVenues?.length || 0;
  score += venueConnections * 3;

  // Content quality indicators
  const readTime = blog.readTime || 0;
  if (readTime >= 3 && readTime <= 15) score += 5; // Optimal reading time

  // Recency factor
  const ageInDays = blog.publishedAt ?
    (Date.now() - (blog.publishedAt.toMillis?.() || Date.now())) / (1000 * 60 * 60 * 24) :
    365;

  const timeframeDays = getTimeframeDays(timeframe);
  const recencyFactor = Math.max(0.1, 1 - (ageInDays / (timeframeDays * 2)));
  score *= recencyFactor;

  return Math.round(score);
};

/**
 * Calculate blog trend score
 * @param {Object} blog - Blog data
 * @param {string} timeframe - Time period to consider
 * @returns {number} Trend score
 */
const calculateBlogTrendScore = (blog, timeframe) => {
  let score = 0;

  // Recent publication bonus
  const ageInDays = blog.publishedAt ?
    (Date.now() - (blog.publishedAt.toMillis?.() || Date.now())) / (1000 * 60 * 60 * 24) :
    365;

  if (ageInDays <= 1) score += 25;       // Published today
  else if (ageInDays <= 7) score += 15;  // This week
  else if (ageInDays <= 30) score += 8;  // This month

  // Engagement velocity (simulated)
  const engagementVelocity = Math.random() * 15;
  score += engagementVelocity;

  // Author activity bonus
  const authorActivityScore = Math.random() * 5;
  score += authorActivityScore;

  return Math.round(score);
};

/**
 * Calculate blog engagement metrics
 * @param {Object} blog - Blog data
 * @returns {Object} Engagement metrics
 */
const calculateBlogEngagement = (blog) => {
  const viewCount = blog.viewCount || 0;
  const readTime = blog.readTime || 0;
  const venueConnections = blog.linkedVenues?.length || 0;

  return {
    viewCount,
    readTime,
    venueConnections,
    engagementScore: Math.round((viewCount * 0.3) + (readTime * 2) + (venueConnections * 5))
  };
};

/**
 * Get personalized venue recommendations
 */
const getPersonalizedVenueRecommendations = async (userUID, preferences, options) => {
  const { limit, location } = options;

  // Get base venues
  const venues = await getPopularVenues({ limit: limit * 2, location });

  // Apply personalization scoring
  return venues.map(venue => {
    let personalScore = venue.popularityScore || 0;

    // Category preferences
    if (preferences.preferredCategories?.includes(venue.category)) {
      personalScore += 10;
    }

    // Tag preferences
    if (preferences.preferredTags && venue.tags) {
      const tagMatches = preferences.preferredTags.filter(tag => venue.tags.includes(tag));
      personalScore += tagMatches.length * 3;
    }

    return {
      ...venue,
      personalScore,
      recommendationType: 'personalized'
    };
  }).sort((a, b) => b.personalScore - a.personalScore).slice(0, limit);
};

/**
 * Get personalized blog recommendations
 */
const getPersonalizedBlogRecommendations = async (userUID, preferences, options) => {
  const { limit } = options;

  // Get base blogs
  const blogs = await getPopularBlogs({ limit: limit * 2 });

  // Apply personalization scoring
  return blogs.map(blog => {
    let personalScore = blog.popularityScore || 0;

    // Category preferences
    if (preferences.preferredBlogCategories?.includes(blog.category)) {
      personalScore += 8;
    }

    // Reading time preferences
    if (preferences.preferredReadTime) {
      const readTime = blog.readTime || 0;
      if (Math.abs(readTime - preferences.preferredReadTime) <= 3) {
        personalScore += 5;
      }
    }

    return {
      ...blog,
      personalScore,
      recommendationType: 'personalized'
    };
  }).sort((a, b) => b.personalScore - a.personalScore).slice(0, limit);
};

/**
 * Get similar venues based on category and tags
 */
const getSimilarVenues = async (venueId, options) => {
  // This would query Firestore for venues with similar attributes
  // For now, return simulated similar venues
  const venues = await getPopularVenues({ limit: options.limit * 2 });
  return venues.slice(0, options.limit).map(venue => ({
    ...venue,
    similarityScore: Math.random() * 100,
    recommendationType: 'similar'
  }));
};

/**
 * Get nearby venues
 */
const getNearbyVenues = async (venueId, options) => {
  // This would use the venue's coordinates to find nearby venues
  // For now, return simulated nearby venues
  const venues = await getPopularVenues({ limit: options.limit * 2 });
  return venues.slice(0, options.limit).map(venue => ({
    ...venue,
    distance: Math.random() * 5, // km
    recommendationType: 'nearby'
  }));
};

/**
 * Get blogs that mention a specific venue
 */
const getBlogsAboutVenue = async (venueId, options) => {
  // This would search for blogs with venue connections
  const blogs = await getPopularBlogs({ limit: options.limit, hasVenues: true });
  return blogs.map(blog => ({
    ...blog,
    venueRelevance: Math.random() * 100,
    recommendationType: 'venue-related'
  }));
};

/**
 * Utility functions
 */

const getTimeframeDays = (timeframe) => {
  switch (timeframe) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'all': return 365;
    default: return 30;
  }
};

const determinePopularityReason = (venue, score) => {
  if (score > 50) return 'Highly popular with many regulars';
  if (score > 30) return 'Well-loved community spot';
  if (score > 15) return 'Growing in popularity';
  return 'Emerging favorite';
};

const determineTrendDirection = (venue, timeframe) => {
  // This would calculate actual trend direction
  const directions = ['rising', 'stable', 'declining'];
  return directions[Math.floor(Math.random() * directions.length)];
};

const calculateContentVelocity = (content) => {
  // Simulated velocity calculation
  return Math.random() > 0.5 ? 'high' : 'moderate';
};

const calculateRecommendationQuality = (recommendations) => {
  const venueScores = recommendations.venues.map(v => v.personalScore || v.popularityScore || 0);
  const blogScores = recommendations.blogs.map(b => b.personalScore || b.popularityScore || 0);
  const allScores = [...venueScores, ...blogScores];

  return allScores.length > 0 ?
    Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) : 0;
};

const extractPersonalizationFactors = (preferences) => {
  const factors = [];
  if (preferences.preferredCategories?.length > 0) factors.push('venue-categories');
  if (preferences.preferredTags?.length > 0) factors.push('venue-amenities');
  if (preferences.preferredBlogCategories?.length > 0) factors.push('blog-interests');
  if (preferences.location) factors.push('location');
  return factors;
};

const calculateDiscoveryScore = (item, userContext) => {
  let score = item.popularityScore || item.trendScore || 0;

  // Diversity bonus
  if (userContext.seenContentTypes && !userContext.seenContentTypes.includes(item.contentType)) {
    score += 5;
  }

  return score;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default {
  getPopularVenues,
  getTrendingVenues,
  getPopularBlogs,
  getTrendingBlogs,
  getPersonalizedRecommendations,
  getVenueBasedRecommendations,
  getDiscoveryFeed
};