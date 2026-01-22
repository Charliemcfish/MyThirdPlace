import { searchBlogsFromIndex, getSearchSuggestions } from './searchIndexing';
import { formatRelativeDate, formatReadingTime } from './content';
import { getBlogs } from './blog';

/**
 * Comprehensive Blog Search Service
 * Provides full-featured blog search with content analysis, filtering, and ranking
 */

/**
 * Search blogs by title with intelligent ranking
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Ranked blog results
 */
export const searchBlogsByTitle = async (query, limit = 20, options = {}) => {
  try {
    const filters = {
      sortBy: 'relevance',
      ...options
    };

    const results = await searchBlogsFromIndex(query, filters, limit);

    // Enhance results with title-specific scoring
    return results.map(result => {
      const titleMatch = result.title.includes(query.toLowerCase());
      const titleScore = titleMatch ? result.matchScore + 5 : result.matchScore;

      return {
        ...result,
        resultType: 'blog',
        searchContext: 'title',
        titleScore: titleScore
      };
    }).sort((a, b) => b.titleScore - a.titleScore);
  } catch (error) {
    console.error('Error searching blogs by title:', error);
    throw new Error('Failed to search blogs by title');
  }
};

/**
 * Full-text content search through blog posts
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Content search results with snippets
 */
export const searchBlogsByContent = async (query, limit = 20, options = {}) => {
  try {
    const filters = {
      sortBy: 'relevance',
      ...options
    };

    const results = await searchBlogsFromIndex(query, filters, limit);

    // Enhance with content-specific features
    return results.map(result => {
      // Estimate reading time category
      const readTimeCategory = categorizeReadTime(result.readTime || 0);

      return {
        ...result,
        resultType: 'blog',
        searchContext: 'content',
        readTimeCategory: readTimeCategory,
        hasContentMatch: result.matchedTerms.length > 0,
        estimatedRelevance: calculateContentRelevance(query, result)
      };
    });
  } catch (error) {
    console.error('Error searching blogs by content:', error);
    throw new Error('Failed to search blogs by content');
  }
};

/**
 * Search blogs by author name
 * @param {string} authorQuery - Author name or partial name
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Author-based blog results
 */
export const searchBlogsByAuthor = async (authorQuery, limit = 20, options = {}) => {
  try {
    const filters = {
      sortBy: 'recent',
      ...options
    };

    const results = await searchBlogsFromIndex(authorQuery, filters, limit);

    // Filter for author matches and enhance
    const authorResults = results.filter(result =>
      result.authorName.includes(authorQuery.toLowerCase())
    );

    return authorResults.map(result => ({
      ...result,
      resultType: 'blog',
      searchContext: 'author',
      authorMatch: true,
      authorBlogCount: 1 // Would be calculated from author's total blogs
    }));
  } catch (error) {
    console.error('Error searching blogs by author:', error);
    throw new Error('Failed to search blogs by author');
  }
};

/**
 * Search blogs about specific venues
 * @param {string} venueQuery - Venue name or related terms
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Venue-related blog results
 */
export const searchBlogsByVenue = async (venueQuery, limit = 20, options = {}) => {
  try {
    const filters = {
      sortBy: 'relevance',
      ...options
    };

    const results = await searchBlogsFromIndex(venueQuery, filters, limit);

    // Filter for venue-related matches
    const venueResults = results.filter(result =>
      result.venueNames.some(name => name.includes(venueQuery.toLowerCase())) ||
      result.linkedVenues.length > 0
    );

    return venueResults.map(result => ({
      ...result,
      resultType: 'blog',
      searchContext: 'venue',
      hasVenueConnection: true,
      connectedVenuesCount: result.linkedVenues?.length || 0
    }));
  } catch (error) {
    console.error('Error searching blogs by venue:', error);
    throw new Error('Failed to search blogs by venue');
  }
};

/**
 * Search blogs by category with advanced filtering
 * @param {string} category - Blog category
 * @param {Object} filters - Additional filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Category-based blog results
 */
export const searchBlogsByCategory = async (category, filters = {}, limit = 20) => {
  try {
    const searchFilters = {
      category: category,
      sortBy: filters.sortBy || 'recent',
      dateRange: filters.dateRange,
      ...filters
    };

    const results = await searchBlogsFromIndex('', searchFilters, limit);

    return results.map(result => ({
      ...result,
      resultType: 'blog',
      searchContext: 'category',
      categoryName: category
    }));
  } catch (error) {
    console.error('Error searching blogs by category:', error);
    throw new Error('Failed to search blogs by category');
  }
};

/**
 * Search blogs within date range
 * @param {Date} startDate - Start date for search
 * @param {Date} endDate - End date for search
 * @param {Object} filters - Additional filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Date-filtered blog results
 */
export const searchBlogsByDateRange = async (startDate, endDate, filters = {}, limit = 20) => {
  try {
    const searchFilters = {
      sortBy: 'recent',
      ...filters
    };

    const results = await searchBlogsFromIndex('', searchFilters, limit * 2);

    // Apply date filtering client-side
    const dateFilteredResults = results.filter(result => {
      const publishedDate = result.publishedAt?.toDate?.() || new Date(result.publishedAt);
      return publishedDate >= startDate && publishedDate <= endDate;
    }).slice(0, limit);

    return dateFilteredResults.map(result => ({
      ...result,
      resultType: 'blog',
      searchContext: 'dateRange',
      dateMatch: true,
      publishedDateFormatted: formatRelativeDate(result.publishedAt)
    }));
  } catch (error) {
    console.error('Error searching blogs by date range:', error);
    throw new Error('Failed to search blogs by date range');
  }
};

/**
 * Combined blog search with all filters and intelligent ranking
 * @param {string} query - Search query
 * @param {Object} filters - All available filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Object>} Combined search results
 */
export const combineBlogSearch = async (query, filters = {}, limit = 20) => {
  try {
    console.log('combineBlogSearch: Starting with query:', query, 'filters:', filters, 'limit:', limit);

    // Get real blog data from existing service
    const blogFilters = {
      category: filters.category === 'all' ? undefined : filters.category
    };

    console.log('combineBlogSearch: Calling getBlogs with filters:', blogFilters);
    const blogData = await getBlogs(1, limit * 2, blogFilters);
    let results = blogData.blogs || [];

    console.log('combineBlogSearch: Got blogs from database:', results.length);

    // Apply text search if query provided
    if (query && query.trim()) {
      console.log('combineBlogSearch: Applying text filter for query:', query);
      const originalCount = results.length;
      results = results.filter(blog => {
        const searchText = `${blog.title} ${blog.content || ''} ${blog.authorName || ''}`.toLowerCase();
        const matches = searchText.includes(query.toLowerCase().trim());
        if (matches) {
          console.log('combineBlogSearch: Blog matches:', blog.title);
        }
        return matches;
      });
      console.log('combineBlogSearch: Filtered from', originalCount, 'to', results.length, 'blogs');
    }

    // Apply additional client-side filters
    if (filters.readTimeRange) {
      results = filterByReadTime(results, filters.readTimeRange);
    }

    if (filters.hasVenues) {
      results = results.filter(result =>
        result.linkedVenues && result.linkedVenues.length > 0
      );
    }

    if (filters.minimumViews) {
      results = results.filter(result =>
        (result.viewCount || 0) >= filters.minimumViews
      );
    }

    // Apply sorting
    results = applySorting(results, filters.sortBy || 'relevance', query);

    const finalResults = results.slice(0, limit);

    // Enhance results with additional metadata
    const enhancedResults = finalResults.map(result => ({
      ...result,
      formattedPublishedDate: formatRelativeDate(result.publishedAt),
      formattedReadTime: formatReadingTime(result.readTime),
      readTimeCategory: categorizeReadTime(result.readTime || 0),
      popularityScore: calculatePopularityScore(result),
      searchRelevance: calculateSearchRelevance(query, result),
      matchScore: calculateBlogMatchScore(query, result)
    }));

    console.log('combineBlogSearch: Returning', enhancedResults.length, 'final results');

    return {
      blogs: enhancedResults,
      totalFound: results.length,
      hasMore: results.length > limit,
      searchQuery: query,
      appliedFilters: filters,
      searchSummary: generateSearchSummary(query, filters, enhancedResults.length)
    };
  } catch (error) {
    console.error('Error in combined blog search:', error);
    throw new Error('Failed to perform combined blog search');
  }
};

/**
 * Get blog search suggestions with context
 * @param {string} partialQuery - Partial search query
 * @param {Object} context - Search context (user preferences, history)
 * @returns {Promise<Array>} Search suggestions
 */
export const getBlogSearchSuggestions = async (partialQuery, context = {}) => {
  try {
    const suggestions = await getSearchSuggestions(partialQuery, 'blog');

    // Enhance suggestions with blog-specific context
    const enhancedSuggestions = suggestions.map(suggestion => ({
      text: suggestion,
      type: 'blog',
      context: determineBlogSearchContext(suggestion),
      icon: getBlogSearchSuggestionIcon(suggestion),
      category: inferCategoryFromSuggestion(suggestion)
    }));

    // Add personalized suggestions if user context available
    if (context.recentSearches) {
      const recentSuggestions = context.recentSearches
        .filter(search => search.includes(partialQuery.toLowerCase()))
        .slice(0, 3)
        .map(search => ({
          text: search,
          type: 'recent',
          context: 'history',
          icon: '🕒'
        }));

      enhancedSuggestions.unshift(...recentSuggestions);
    }

    return enhancedSuggestions;
  } catch (error) {
    console.error('Error getting blog search suggestions:', error);
    return [];
  }
};

/**
 * Get trending blog searches
 * @param {string} timeframe - 'today', 'week', 'month'
 * @param {number} limit - Number of trending searches
 * @returns {Promise<Array>} Trending search terms
 */
export const getTrendingBlogSearches = async (timeframe = 'week', limit = 10) => {
  try {
    // This would typically come from search analytics
    // For now, return example trending searches
    const trendingByTimeframe = {
      today: ['remote work', 'community building', 'third places', 'wellness', 'coworking'],
      week: ['coffee culture', 'library spaces', 'urban planning', 'social connection', 'local community'],
      month: ['neighborhood gems', 'work from cafe', 'community spaces', 'third place theory', 'local culture']
    };

    const trending = trendingByTimeframe[timeframe] || trendingByTimeframe.week;

    return trending.slice(0, limit).map(search => ({
      text: search,
      type: 'trending',
      timeframe: timeframe,
      trendScore: Math.floor(Math.random() * 100) + 50 // Simulated trend score
    }));
  } catch (error) {
    console.error('Error getting trending blog searches:', error);
    return [];
  }
};

/**
 * Helper Functions
 */

/**
 * Categorize reading time into short/medium/long
 * @param {number} readTime - Reading time in minutes
 * @returns {string} Category
 */
const categorizeReadTime = (readTime) => {
  if (readTime < 3) return 'quick';
  if (readTime < 8) return 'short';
  if (readTime < 15) return 'medium';
  return 'long';
};

/**
 * Filter blogs by reading time range
 * @param {Array} blogs - Blog results
 * @param {string} range - 'quick', 'short', 'medium', 'long'
 * @returns {Array} Filtered blogs
 */
const filterByReadTime = (blogs, range) => {
  return blogs.filter(blog => {
    const category = categorizeReadTime(blog.readTime || 0);
    return category === range;
  });
};

/**
 * Apply sorting to blog results
 * @param {Array} results - Blog results
 * @param {string} sortBy - Sort method
 * @param {string} query - Original query for relevance
 * @returns {Array} Sorted results
 */
const applySorting = (results, sortBy, query) => {
  switch (sortBy) {
    case 'popular':
      return results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    case 'recent':
      return results.sort((a, b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0));
    case 'oldest':
      return results.sort((a, b) => (a.publishedAt?.toMillis?.() || 0) - (b.publishedAt?.toMillis?.() || 0));
    case 'readTime':
      return results.sort((a, b) => (a.readTime || 0) - (b.readTime || 0));
    case 'relevance':
    default:
      return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }
};

/**
 * Calculate content relevance score
 * @param {string} query - Search query
 * @param {Object} result - Blog result
 * @returns {number} Relevance score
 */
const calculateContentRelevance = (query, result) => {
  if (!query) return 0;

  let score = result.matchScore || 0;

  // Boost if title contains query
  if (result.title.includes(query.toLowerCase())) {
    score += 10;
  }

  // Boost if author name matches
  if (result.authorName.includes(query.toLowerCase())) {
    score += 5;
  }

  // Consider content length and read time
  if (result.readTime > 0 && result.readTime < 20) {
    score += 2; // Boost for reasonable length articles
  }

  return score;
};

/**
 * Calculate popularity score
 * @param {Object} blog - Blog data
 * @returns {number} Popularity score
 */
const calculatePopularityScore = (blog) => {
  const viewCount = blog.viewCount || 0;
  const ageInDays = blog.publishedAt ?
    (Date.now() - (blog.publishedAt.toMillis?.() || Date.now())) / (1000 * 60 * 60 * 24) :
    0;

  // Decay score over time
  const decayFactor = Math.max(0.1, 1 - (ageInDays / 365));
  return Math.round(viewCount * decayFactor);
};

/**
 * Calculate search relevance
 * @param {string} query - Search query
 * @param {Object} result - Search result
 * @returns {number} Relevance score
 */
const calculateSearchRelevance = (query, result) => {
  if (!query) return 0;
  return result.matchScore || 0;
};

/**
 * Generate search summary
 * @param {string} query - Search query
 * @param {Object} filters - Applied filters
 * @param {number} resultCount - Number of results found
 * @returns {string} Search summary
 */
const generateSearchSummary = (query, filters, resultCount) => {
  let summary = '';

  if (query) {
    summary += `"${query}"`;
  }

  if (filters.category && filters.category !== 'all') {
    summary += summary ? ` in ${filters.category}` : `${filters.category} blogs`;
  }

  if (filters.dateRange) {
    summary += ` from ${filters.dateRange}`;
  }

  summary += ` - ${resultCount} result${resultCount !== 1 ? 's' : ''}`;

  return summary;
};

/**
 * Determine search context from suggestion
 * @param {string} suggestion - Suggestion text
 * @returns {string} Context type
 */
const determineBlogSearchContext = (suggestion) => {
  if (suggestion.includes('author') || suggestion.includes('by ')) return 'author';
  if (suggestion.includes('category')) return 'category';
  if (suggestion.includes('venue') || suggestion.includes('place')) return 'venue';
  return 'general';
};

/**
 * Get icon for blog search suggestion
 * @param {string} suggestion - Suggestion text
 * @returns {string} Icon emoji
 */
const getBlogSearchSuggestionIcon = (suggestion) => {
  if (suggestion.includes('community')) return '👥';
  if (suggestion.includes('work') || suggestion.includes('coworking')) return '💼';
  if (suggestion.includes('culture')) return '🎭';
  if (suggestion.includes('wellness')) return '🌟';
  if (suggestion.includes('food') || suggestion.includes('cafe')) return '☕';
  return '📝';
};

/**
 * Infer category from suggestion text
 * @param {string} suggestion - Suggestion text
 * @returns {string} Inferred category
 */
const inferCategoryFromSuggestion = (suggestion) => {
  if (suggestion.includes('community')) return 'community-building';
  if (suggestion.includes('work') || suggestion.includes('coworking')) return 'remote-work';
  if (suggestion.includes('culture')) return 'local-culture';
  if (suggestion.includes('wellness')) return 'wellness-community';
  return null;
};

/**
 * Calculate match score for blog search results
 */
const calculateBlogMatchScore = (query, blog) => {
  if (!query) return 0;

  const queryLower = query.toLowerCase();
  let score = 0;

  // Title match gets highest score
  if (blog.title.toLowerCase() === queryLower) {
    score += 100;
  } else if (blog.title.toLowerCase().includes(queryLower)) {
    score += 60;
  }

  // Content match
  if (blog.content && blog.content.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  // Author match
  if (blog.authorName && blog.authorName.toLowerCase().includes(queryLower)) {
    score += 40;
  }

  // Category match
  if (blog.category && blog.category.toLowerCase().includes(queryLower)) {
    score += 35;
  }

  return score;
};

export default {
  searchBlogsByTitle,
  searchBlogsByContent,
  searchBlogsByAuthor,
  searchBlogsByVenue,
  searchBlogsByCategory,
  searchBlogsByDateRange,
  combineBlogSearch,
  getBlogSearchSuggestions,
  getTrendingBlogSearches
};