import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Search Analytics and Performance Optimization Service
 * Tracks search behavior, performance metrics, and provides optimization insights
 */

// Storage keys
const STORAGE_KEYS = {
  SEARCH_HISTORY: '@search_history',
  SEARCH_PERFORMANCE: '@search_performance',
  POPULAR_SEARCHES: '@popular_searches',
  USER_PREFERENCES: '@user_search_preferences',
  SEARCH_CACHE: '@search_cache'
};

// Cache configuration
const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100,
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  MAX_HISTORY_SIZE: 50,
  PERFORMANCE_SAMPLE_RATE: 0.1 // 10% of searches tracked for performance
};

/**
 * Track a search query and its results
 * @param {Object} searchData - Search query data
 * @returns {Promise<void>}
 */
export const trackSearch = async (searchData) => {
  try {
    const {
      query,
      contentType,
      filters,
      resultCount,
      executionTime,
      userLocation,
      selectedResult
    } = searchData;

    const searchEntry = {
      id: generateSearchId(),
      query: query.toLowerCase().trim(),
      contentType,
      filters,
      resultCount,
      executionTime,
      userLocation,
      selectedResult,
      timestamp: Date.now(),
      sessionId: await getSessionId()
    };

    // Track to search history
    await addToSearchHistory(searchEntry);

    // Update popular searches
    await updatePopularSearches(query);

    // Track performance if sampling
    if (shouldTrackPerformance()) {
      await trackSearchPerformance(searchEntry);
    }

    // Update user preferences
    await updateUserPreferences(searchEntry);

    console.log('Search tracked:', query);
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

/**
 * Track user interaction with search results
 * @param {Object} interactionData - Interaction data
 * @returns {Promise<void>}
 */
export const trackSearchInteraction = async (interactionData) => {
  try {
    const {
      searchId,
      resultType,
      resultId,
      position,
      interactionType, // 'click', 'view', 'share', 'save'
      timeSpent
    } = interactionData;

    const interaction = {
      searchId,
      resultType,
      resultId,
      position,
      interactionType,
      timeSpent,
      timestamp: Date.now()
    };

    // Store interaction data
    const interactions = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const searchIndex = interactions.findIndex(s => s.id === searchId);

    if (searchIndex !== -1) {
      if (!interactions[searchIndex].interactions) {
        interactions[searchIndex].interactions = [];
      }
      interactions[searchIndex].interactions.push(interaction);
      await storeData(STORAGE_KEYS.SEARCH_HISTORY, interactions);
    }

    console.log('Search interaction tracked:', interactionType);
  } catch (error) {
    console.error('Error tracking search interaction:', error);
  }
};

/**
 * Get search analytics data
 * @param {string} timeframe - 'day', 'week', 'month', 'all'
 * @returns {Promise<Object>} Analytics data
 */
export const getSearchAnalytics = async (timeframe = 'week') => {
  try {
    const searchHistory = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const performanceData = await getStoredData(STORAGE_KEYS.SEARCH_PERFORMANCE) || [];
    const popularSearches = await getStoredData(STORAGE_KEYS.POPULAR_SEARCHES) || {};

    const timeframeDays = getTimeframeDays(timeframe);
    const cutoffTime = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);

    // Filter data by timeframe
    const recentSearches = searchHistory.filter(search => search.timestamp >= cutoffTime);
    const recentPerformance = performanceData.filter(perf => perf.timestamp >= cutoffTime);

    // Calculate analytics
    const analytics = {
      totalSearches: recentSearches.length,
      uniqueQueries: new Set(recentSearches.map(s => s.query)).size,
      averageResultCount: calculateAverage(recentSearches.map(s => s.resultCount)),
      averageExecutionTime: calculateAverage(recentPerformance.map(p => p.executionTime)),
      topQueries: getTopQueries(recentSearches, 10),
      searchTrends: calculateSearchTrends(recentSearches, timeframeDays),
      contentTypeDistribution: calculateContentTypeDistribution(recentSearches),
      performanceMetrics: calculatePerformanceMetrics(recentPerformance),
      userEngagement: calculateUserEngagement(recentSearches),
      conversionRate: calculateConversionRate(recentSearches),
      timeframe,
      generatedAt: Date.now()
    };

    return analytics;
  } catch (error) {
    console.error('Error getting search analytics:', error);
    throw new Error('Failed to get search analytics');
  }
};

/**
 * Get popular search queries
 * @param {number} limit - Number of queries to return
 * @param {string} timeframe - Time period
 * @returns {Promise<Array>} Popular queries
 */
export const getPopularQueries = async (limit = 10, timeframe = 'week') => {
  try {
    const searchHistory = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const timeframeDays = getTimeframeDays(timeframe);
    const cutoffTime = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);

    const recentSearches = searchHistory.filter(search => search.timestamp >= cutoffTime);
    const queryCount = {};

    recentSearches.forEach(search => {
      const query = search.query;
      queryCount[query] = (queryCount[query] || 0) + 1;
    });

    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({
        query,
        count,
        trend: calculateQueryTrend(query, searchHistory, timeframeDays)
      }));
  } catch (error) {
    console.error('Error getting popular queries:', error);
    return [];
  }
};

/**
 * Get search suggestions based on user history
 * @param {string} partialQuery - Partial search query
 * @param {number} limit - Number of suggestions
 * @returns {Promise<Array>} Search suggestions
 */
export const getPersonalizedSuggestions = async (partialQuery, limit = 5) => {
  try {
    const searchHistory = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const userPreferences = await getStoredData(STORAGE_KEYS.USER_PREFERENCES) || {};

    // Get matching queries from history
    const matchingQueries = searchHistory
      .filter(search => search.query.includes(partialQuery.toLowerCase()))
      .map(search => search.query)
      .filter((query, index, array) => array.indexOf(query) === index) // Remove duplicates
      .slice(0, limit);

    // Add personalized suggestions based on preferences
    const personalizedSuggestions = generatePersonalizedSuggestions(
      partialQuery,
      userPreferences,
      limit - matchingQueries.length
    );

    return [
      ...matchingQueries.map(query => ({ query, type: 'history', score: 1 })),
      ...personalizedSuggestions
    ].slice(0, limit);
  } catch (error) {
    console.error('Error getting personalized suggestions:', error);
    return [];
  }
};

/**
 * Cache search results for performance
 * @param {string} cacheKey - Cache key
 * @param {Object} results - Search results
 * @returns {Promise<void>}
 */
export const cacheSearchResults = async (cacheKey, results) => {
  try {
    const cache = await getStoredData(STORAGE_KEYS.SEARCH_CACHE) || {};

    // Clean old cache entries
    const cleanedCache = cleanCache(cache);

    // Add new entry
    cleanedCache[cacheKey] = {
      results,
      timestamp: Date.now(),
      hits: 1
    };

    // Limit cache size
    if (Object.keys(cleanedCache).length > CACHE_CONFIG.MAX_CACHE_SIZE) {
      const entries = Object.entries(cleanedCache);
      entries.sort(([,a], [,b]) => b.timestamp - a.timestamp);
      const limitedCache = Object.fromEntries(entries.slice(0, CACHE_CONFIG.MAX_CACHE_SIZE));
      await storeData(STORAGE_KEYS.SEARCH_CACHE, limitedCache);
    } else {
      await storeData(STORAGE_KEYS.SEARCH_CACHE, cleanedCache);
    }
  } catch (error) {
    console.error('Error caching search results:', error);
  }
};

/**
 * Get cached search results
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Cached results or null
 */
export const getCachedResults = async (cacheKey) => {
  try {
    const cache = await getStoredData(STORAGE_KEYS.SEARCH_CACHE) || {};
    const entry = cache[cacheKey];

    if (!entry) return null;

    // Check if cache is still valid
    const isValid = (Date.now() - entry.timestamp) < CACHE_CONFIG.CACHE_DURATION;
    if (!isValid) {
      // Remove expired entry
      delete cache[cacheKey];
      await storeData(STORAGE_KEYS.SEARCH_CACHE, cache);
      return null;
    }

    // Update hit count
    entry.hits += 1;
    cache[cacheKey] = entry;
    await storeData(STORAGE_KEYS.SEARCH_CACHE, cache);

    return entry.results;
  } catch (error) {
    console.error('Error getting cached results:', error);
    return null;
  }
};

/**
 * Generate cache key for search
 * @param {string} query - Search query
 * @param {Object} filters - Applied filters
 * @param {string} contentType - Content type
 * @returns {string} Cache key
 */
export const generateCacheKey = (query, filters = {}, contentType = 'all') => {
  const normalizedQuery = query.toLowerCase().trim();
  const sortedFilters = Object.keys(filters).sort().reduce((result, key) => {
    result[key] = filters[key];
    return result;
  }, {});

  return `${normalizedQuery}:${contentType}:${JSON.stringify(sortedFilters)}`;
};

/**
 * Get search performance recommendations
 * @returns {Promise<Array>} Performance recommendations
 */
export const getPerformanceRecommendations = async () => {
  try {
    const performanceData = await getStoredData(STORAGE_KEYS.SEARCH_PERFORMANCE) || [];
    const cache = await getStoredData(STORAGE_KEYS.SEARCH_CACHE) || {};
    const searchHistory = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];

    const recommendations = [];

    // Analyze performance data
    const avgExecutionTime = calculateAverage(performanceData.map(p => p.executionTime));
    if (avgExecutionTime > 1000) { // >1 second
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Search Speed Optimization',
        description: 'Search queries are taking longer than optimal (>1s average)',
        suggestion: 'Consider implementing search result caching and query optimization'
      });
    }

    // Analyze cache effectiveness
    const cacheEntries = Object.values(cache);
    const avgCacheHits = calculateAverage(cacheEntries.map(entry => entry.hits));
    if (avgCacheHits < 2) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        title: 'Cache Optimization',
        description: 'Search cache is not being utilized effectively',
        suggestion: 'Review cache keys and duration settings'
      });
    }

    // Analyze search patterns
    const recentSearches = searchHistory.filter(s =>
      Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000 // Last week
    );
    const emptyResults = recentSearches.filter(s => s.resultCount === 0);
    const emptyResultRate = emptyResults.length / recentSearches.length;

    if (emptyResultRate > 0.3) { // >30% empty results
      recommendations.push({
        type: 'content',
        priority: 'medium',
        title: 'Search Result Improvement',
        description: `${Math.round(emptyResultRate * 100)}% of searches return no results`,
        suggestion: 'Review search indexing and add more content or improve search algorithms'
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error getting performance recommendations:', error);
    return [];
  }
};

/**
 * Clear old analytics data
 * @param {number} daysToKeep - Days of data to keep
 * @returns {Promise<void>}
 */
export const cleanupAnalyticsData = async (daysToKeep = 90) => {
  try {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    // Clean search history
    const searchHistory = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const cleanedHistory = searchHistory.filter(search => search.timestamp >= cutoffTime);
    await storeData(STORAGE_KEYS.SEARCH_HISTORY, cleanedHistory);

    // Clean performance data
    const performanceData = await getStoredData(STORAGE_KEYS.SEARCH_PERFORMANCE) || [];
    const cleanedPerformance = performanceData.filter(perf => perf.timestamp >= cutoffTime);
    await storeData(STORAGE_KEYS.SEARCH_PERFORMANCE, cleanedPerformance);

    // Clean cache
    const cache = await getStoredData(STORAGE_KEYS.SEARCH_CACHE) || {};
    const cleanedCache = cleanCache(cache);
    await storeData(STORAGE_KEYS.SEARCH_CACHE, cleanedCache);

    console.log('Analytics data cleaned successfully');
  } catch (error) {
    console.error('Error cleaning analytics data:', error);
  }
};

/**
 * Helper Functions
 */

const addToSearchHistory = async (searchEntry) => {
  try {
    const history = await getStoredData(STORAGE_KEYS.SEARCH_HISTORY) || [];
    history.unshift(searchEntry);

    // Limit history size
    const limitedHistory = history.slice(0, CACHE_CONFIG.MAX_HISTORY_SIZE);
    await storeData(STORAGE_KEYS.SEARCH_HISTORY, limitedHistory);
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

const updatePopularSearches = async (query) => {
  try {
    const popular = await getStoredData(STORAGE_KEYS.POPULAR_SEARCHES) || {};
    popular[query] = (popular[query] || 0) + 1;
    await storeData(STORAGE_KEYS.POPULAR_SEARCHES, popular);
  } catch (error) {
    console.error('Error updating popular searches:', error);
  }
};

const trackSearchPerformance = async (searchEntry) => {
  try {
    const performance = await getStoredData(STORAGE_KEYS.SEARCH_PERFORMANCE) || [];
    performance.push({
      executionTime: searchEntry.executionTime,
      resultCount: searchEntry.resultCount,
      contentType: searchEntry.contentType,
      timestamp: searchEntry.timestamp
    });

    // Limit performance data size
    const limitedPerformance = performance.slice(-1000); // Keep last 1000 entries
    await storeData(STORAGE_KEYS.SEARCH_PERFORMANCE, limitedPerformance);
  } catch (error) {
    console.error('Error tracking search performance:', error);
  }
};

const updateUserPreferences = async (searchEntry) => {
  try {
    const preferences = await getStoredData(STORAGE_KEYS.USER_PREFERENCES) || {
      preferredContentTypes: {},
      preferredCategories: {},
      searchPatterns: {}
    };

    // Update content type preferences
    const contentType = searchEntry.contentType || 'all';
    preferences.preferredContentTypes[contentType] =
      (preferences.preferredContentTypes[contentType] || 0) + 1;

    // Update category preferences from filters
    if (searchEntry.filters?.category) {
      preferences.preferredCategories[searchEntry.filters.category] =
        (preferences.preferredCategories[searchEntry.filters.category] || 0) + 1;
    }

    await storeData(STORAGE_KEYS.USER_PREFERENCES, preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
};

const generateSearchId = () => {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getSessionId = async () => {
  try {
    let sessionId = await AsyncStorage.getItem('@session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('@session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    return 'default_session';
  }
};

const shouldTrackPerformance = () => {
  return Math.random() < CACHE_CONFIG.PERFORMANCE_SAMPLE_RATE;
};

const getStoredData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting stored data for ${key}:`, error);
    return null;
  }
};

const storeData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
  }
};

const getTimeframeDays = (timeframe) => {
  switch (timeframe) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'all': return 365;
    default: return 7;
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const getTopQueries = (searches, limit) => {
  const queryCount = {};
  searches.forEach(search => {
    queryCount[search.query] = (queryCount[search.query] || 0) + 1;
  });

  return Object.entries(queryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
};

const calculateSearchTrends = (searches, days) => {
  const dailySearches = {};
  const now = Date.now();

  for (let i = 0; i < days; i++) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000)).toDateString();
    dailySearches[date] = 0;
  }

  searches.forEach(search => {
    const date = new Date(search.timestamp).toDateString();
    if (dailySearches[date] !== undefined) {
      dailySearches[date]++;
    }
  });

  return Object.entries(dailySearches).map(([date, count]) => ({ date, count }));
};

const calculateContentTypeDistribution = (searches) => {
  const distribution = {};
  searches.forEach(search => {
    const type = search.contentType || 'all';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  return distribution;
};

const calculatePerformanceMetrics = (performanceData) => {
  if (performanceData.length === 0) {
    return { avgExecutionTime: 0, slowQueries: 0, fastQueries: 0 };
  }

  const executionTimes = performanceData.map(p => p.executionTime);
  const avgExecutionTime = calculateAverage(executionTimes);
  const slowQueries = executionTimes.filter(time => time > 1000).length;
  const fastQueries = executionTimes.filter(time => time < 500).length;

  return {
    avgExecutionTime: Math.round(avgExecutionTime),
    slowQueries,
    fastQueries,
    totalQueries: performanceData.length
  };
};

const calculateUserEngagement = (searches) => {
  const interactionCount = searches.reduce((count, search) => {
    return count + (search.interactions ? search.interactions.length : 0);
  }, 0);

  return {
    totalInteractions: interactionCount,
    avgInteractionsPerSearch: searches.length > 0 ? interactionCount / searches.length : 0,
    engagementRate: searches.length > 0 ? (interactionCount / searches.length) * 100 : 0
  };
};

const calculateConversionRate = (searches) => {
  const searchesWithResults = searches.filter(s => s.resultCount > 0);
  const searchesWithInteractions = searches.filter(s =>
    s.interactions && s.interactions.some(i => i.interactionType === 'click')
  );

  return {
    searchesWithResults: searchesWithResults.length,
    searchesWithInteractions: searchesWithInteractions.length,
    conversionRate: searchesWithResults.length > 0 ?
      (searchesWithInteractions.length / searchesWithResults.length) * 100 : 0
  };
};

const calculateQueryTrend = (query, searchHistory, days) => {
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  const recentCount = searchHistory.filter(s =>
    s.query === query && s.timestamp >= cutoffTime
  ).length;

  const previousCutoff = cutoffTime - (days * 24 * 60 * 60 * 1000);
  const previousCount = searchHistory.filter(s =>
    s.query === query && s.timestamp >= previousCutoff && s.timestamp < cutoffTime
  ).length;

  if (previousCount === 0) return recentCount > 0 ? 'new' : 'stable';
  const changeRate = ((recentCount - previousCount) / previousCount) * 100;

  if (changeRate > 20) return 'rising';
  if (changeRate < -20) return 'declining';
  return 'stable';
};

const generatePersonalizedSuggestions = (partialQuery, preferences, limit) => {
  const suggestions = [];

  // Add suggestions based on preferred content types
  if (preferences.preferredContentTypes) {
    const topContentType = Object.entries(preferences.preferredContentTypes)
      .sort(([,a], [,b]) => b - a)[0];

    if (topContentType && suggestions.length < limit) {
      suggestions.push({
        query: `${partialQuery} ${topContentType[0]}`,
        type: 'personalized',
        score: 0.8
      });
    }
  }

  // Add suggestions based on preferred categories
  if (preferences.preferredCategories && suggestions.length < limit) {
    const topCategory = Object.entries(preferences.preferredCategories)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      suggestions.push({
        query: `${partialQuery} ${topCategory[0]}`,
        type: 'personalized',
        score: 0.7
      });
    }
  }

  return suggestions;
};

const cleanCache = (cache) => {
  const now = Date.now();
  const cleaned = {};

  Object.entries(cache).forEach(([key, entry]) => {
    if (now - entry.timestamp < CACHE_CONFIG.CACHE_DURATION) {
      cleaned[key] = entry;
    }
  });

  return cleaned;
};

export default {
  trackSearch,
  trackSearchInteraction,
  getSearchAnalytics,
  getPopularQueries,
  getPersonalizedSuggestions,
  cacheSearchResults,
  getCachedResults,
  generateCacheKey,
  getPerformanceRecommendations,
  cleanupAnalyticsData
};