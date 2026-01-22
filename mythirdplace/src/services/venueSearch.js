import { searchVenuesFromIndex, getSearchSuggestions } from './searchIndexing';
import { calculateDistance } from './geocoding';
import { getRegularCount } from './userVenueRelationships';
import { getVenues } from './venue';

/**
 * Advanced Venue Search Service
 * Provides comprehensive venue search functionality with filtering, sorting, and ranking
 */

/**
 * Search venues by name with ranking
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Ranked venue results
 */
export const searchVenuesByName = async (query, limit = 20, options = {}) => {
  try {
    // Use existing venue service to get real data
    const venueData = await getVenues({ limitCount: limit * 2 });
    const venues = venueData.venues || [];

    // Filter venues by name/description match
    const filteredVenues = venues.filter(venue => {
      const searchText = `${venue.name} ${venue.description || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Enhance results with additional data
    return filteredVenues.slice(0, limit).map(result => ({
      ...result,
      resultType: 'venue',
      searchContext: 'name',
      matchScore: calculateMatchScore(query, result)
    }));
  } catch (error) {
    console.error('Error searching venues by name:', error);
    throw new Error('Failed to search venues by name');
  }
};

/**
 * Search venues by location (city, area, etc.)
 * @param {string} locationQuery - Location to search in
 * @param {number} limit - Number of results to return
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Location-based venue results
 */
export const searchVenuesByLocation = async (locationQuery, limit = 20, options = {}) => {
  try {
    const filters = {
      sortBy: 'popular',
      ...options
    };

    // Use location terms as search query
    const results = await searchVenuesFromIndex(locationQuery, filters, limit);

    // Filter for location-specific matches
    const locationResults = results.filter(result =>
      result.city.includes(locationQuery.toLowerCase()) ||
      result.country.includes(locationQuery.toLowerCase()) ||
      result.matchedTerms.some(term =>
        result.city.includes(term) || result.country.includes(term)
      )
    );

    return locationResults.map(result => ({
      ...result,
      resultType: 'venue',
      searchContext: 'location'
    }));
  } catch (error) {
    console.error('Error searching venues by location:', error);
    throw new Error('Failed to search venues by location');
  }
};

/**
 * Search venues by category with additional filters
 * @param {string} category - Venue category
 * @param {Object} filters - Additional filters (tags, location, etc.)
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Category-based venue results
 */
export const searchVenuesByCategory = async (category, filters = {}, limit = 20) => {
  try {
    const searchFilters = {
      category: category,
      sortBy: filters.sortBy || 'popular',
      tags: filters.tags || [],
      ...filters
    };

    const results = await searchVenuesFromIndex('', searchFilters, limit);

    return results.map(result => ({
      ...result,
      resultType: 'venue',
      searchContext: 'category',
      categoryName: category
    }));
  } catch (error) {
    console.error('Error searching venues by category:', error);
    throw new Error('Failed to search venues by category');
  }
};

/**
 * Search venues by tags with intelligent matching
 * @param {Array} selectedTags - Array of tag IDs
 * @param {Object} filters - Additional filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Tag-based venue results
 */
export const searchVenuesByTags = async (selectedTags, filters = {}, limit = 20) => {
  try {
    if (!selectedTags || selectedTags.length === 0) {
      return [];
    }

    const searchFilters = {
      tags: selectedTags,
      sortBy: filters.sortBy || 'popular',
      ...filters
    };

    const results = await searchVenuesFromIndex('', searchFilters, limit);

    // Calculate tag match score
    const scoredResults = results.map(result => {
      const matchedTags = selectedTags.filter(tag => result.tags.includes(tag));
      const tagMatchScore = (matchedTags.length / selectedTags.length) * 100;

      return {
        ...result,
        resultType: 'venue',
        searchContext: 'tags',
        matchedTags: matchedTags,
        tagMatchScore: tagMatchScore
      };
    });

    // Sort by tag match score
    scoredResults.sort((a, b) => b.tagMatchScore - a.tagMatchScore);

    return scoredResults;
  } catch (error) {
    console.error('Error searching venues by tags:', error);
    throw new Error('Failed to search venues by tags');
  }
};

/**
 * Search venues near a location with distance calculation
 * @param {Object} coordinates - { lat, lng } coordinates
 * @param {number} radius - Search radius in kilometers
 * @param {Object} filters - Additional filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Location-based venue results with distances
 */
export const searchVenuesNearLocation = async (coordinates, radius = 25, filters = {}, limit = 20) => {
  try {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      throw new Error('Valid coordinates required for location search');
    }

    const searchFilters = {
      sortBy: 'popular',
      ...filters
    };

    // Get more results to filter by distance
    const results = await searchVenuesFromIndex('', searchFilters, limit * 3);

    // Calculate distances and filter by radius
    const nearbyResults = results
      .map(result => {
        if (!result.coordinates) return null;

        const distance = calculateDistance(coordinates, {
          lat: result.coordinates.latitude || result.coordinates.lat,
          lng: result.coordinates.longitude || result.coordinates.lng
        });

        if (distance === null || distance > radius) return null;

        return {
          ...result,
          distance: distance,
          resultType: 'venue',
          searchContext: 'location'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, limit);

    return nearbyResults;
  } catch (error) {
    console.error('Error searching venues near location:', error);
    throw new Error('Failed to search venues near location');
  }
};

/**
 * Combined venue search with all filters
 * @param {string} query - Search query
 * @param {Object} filters - All available filters
 * @param {number} limit - Number of results to return
 * @returns {Promise<Object>} Combined search results
 */
export const combineVenueSearch = async (query, filters = {}, limit = 20) => {
  try {
    console.log('combineVenueSearch: Starting with query:', query, 'filters:', filters, 'limit:', limit);

    // Get real venue data from existing service
    const venueOptions = {
      limitCount: limit * 3,
      category: filters.category
    };

    console.log('combineVenueSearch: Calling getVenues with options:', venueOptions);
    const venueData = await getVenues(venueOptions);
    let results = venueData.venues || [];

    console.log('combineVenueSearch: Got venues from database:', results.length);

    // Apply text search if query provided
    if (query && query.trim()) {
      console.log('combineVenueSearch: Applying text filter for query:', query);
      const originalCount = results.length;
      results = results.filter(venue => {
        const searchText = `${venue.name} ${venue.description || ''} ${venue.address?.city || ''} ${venue.address?.country || ''}`.toLowerCase();
        const matches = searchText.includes(query.toLowerCase().trim());
        if (matches) {
          console.log('combineVenueSearch: Venue matches:', venue.name);
        }
        return matches;
      });
      console.log('combineVenueSearch: Filtered from', originalCount, 'to', results.length, 'venues');
    }

    // Apply additional client-side filters
    if (filters.hasBlogs) {
      // This would require checking blog-venue relationships
      // For now, we'll simulate this filter
      results = results.filter(result => Math.random() > 0.5); // Placeholder
    }

    // Apply location-based filtering if coordinates provided
    if (filters.coordinates && filters.maxDistance) {
      results = results
        .map(result => {
          if (!result.coordinates) return null;

          const distance = calculateDistance(filters.coordinates, {
            lat: result.coordinates.latitude || result.coordinates.lat,
            lng: result.coordinates.longitude || result.coordinates.lng
          });

          if (distance === null || distance > filters.maxDistance) return null;

          return { ...result, distance };
        })
        .filter(Boolean);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'distance':
        if (filters.coordinates) {
          results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'popular':
        results.sort((a, b) => (b.regularCount || 0) - (a.regularCount || 0));
        break;
      case 'recent':
        results.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        break;
      case 'alphabetical':
        results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }

    const finalResults = results.slice(0, limit);

    console.log('combineVenueSearch: Returning', finalResults.length, 'final results');

    return {
      venues: finalResults,
      totalFound: results.length,
      hasMore: results.length > limit,
      searchQuery: query,
      appliedFilters: filters
    };
  } catch (error) {
    console.error('Error in combined venue search:', error);
    throw new Error('Failed to perform combined venue search');
  }
};

/**
 * Get venue search suggestions
 * @param {string} partialQuery - Partial search query
 * @param {Object} context - Search context (user location, preferences)
 * @returns {Promise<Array>} Search suggestions
 */
export const getVenueSearchSuggestions = async (partialQuery, context = {}) => {
  try {
    const suggestions = await getSearchSuggestions(partialQuery, 'venue');

    // Enhance suggestions with context
    const enhancedSuggestions = suggestions.map(suggestion => ({
      text: suggestion,
      type: 'venue',
      context: determineSearchContext(suggestion),
      icon: getSearchSuggestionIcon(suggestion)
    }));

    // Add location-based suggestions if user location available
    if (context.userLocation) {
      enhancedSuggestions.unshift({
        text: `"${partialQuery}" near me`,
        type: 'location',
        context: 'location',
        icon: '📍'
      });
    }

    return enhancedSuggestions;
  } catch (error) {
    console.error('Error getting venue search suggestions:', error);
    return [];
  }
};

/**
 * Get popular venue searches
 * @param {number} limit - Number of popular searches to return
 * @returns {Promise<Array>} Popular search terms
 */
export const getPopularVenueSearches = async (limit = 10) => {
  try {
    // This would typically come from search analytics
    // For now, return some example popular searches
    const popularSearches = [
      'coffee shop',
      'library',
      'gym',
      'coworking space',
      'park',
      'cafe with wifi',
      'pet friendly',
      'accessible',
      'free parking',
      'outdoor seating'
    ];

    return popularSearches.slice(0, limit).map(search => ({
      text: search,
      type: 'popular',
      searches: Math.floor(Math.random() * 1000) + 100 // Simulated search count
    }));
  } catch (error) {
    console.error('Error getting popular venue searches:', error);
    return [];
  }
};

/**
 * Determine search context from suggestion text
 * @param {string} suggestion - Suggestion text
 * @returns {string} Context type
 */
const determineSearchContext = (suggestion) => {
  const categories = ['cafe', 'library', 'gym', 'sauna', 'coworking', 'park'];
  const locations = ['london', 'manchester', 'birmingham', 'bristol'];

  if (categories.some(cat => suggestion.includes(cat))) {
    return 'category';
  } else if (locations.some(loc => suggestion.includes(loc))) {
    return 'location';
  } else {
    return 'general';
  }
};

/**
 * Get icon for search suggestion
 * @param {string} suggestion - Suggestion text
 * @returns {string} Icon emoji
 */
const getSearchSuggestionIcon = (suggestion) => {
  if (suggestion.includes('cafe') || suggestion.includes('coffee')) return '☕';
  if (suggestion.includes('library')) return '📚';
  if (suggestion.includes('gym')) return '💪';
  if (suggestion.includes('sauna')) return '🧖';
  if (suggestion.includes('coworking')) return '💼';
  if (suggestion.includes('park')) return '🌳';
  if (suggestion.includes('restaurant')) return '🍽️';
  return '🏢';
};

/**
 * Advanced venue search with machine learning ranking (placeholder)
 * @param {string} query - Search query
 * @param {Object} userContext - User preferences and history
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Personalized search results
 */
export const searchVenuesWithPersonalization = async (query, userContext = {}, filters = {}) => {
  try {
    // Get base search results
    const baseResults = await combineVenueSearch(query, filters, 50);

    // Apply personalization scoring (simplified)
    const personalizedResults = baseResults.venues.map(venue => {
      let personalScore = venue.matchScore || 0;

      // Boost venues in categories user likes
      if (userContext.preferredCategories && userContext.preferredCategories.includes(venue.category)) {
        personalScore += 5;
      }

      // Boost venues with tags user prefers
      if (userContext.preferredTags && venue.tags) {
        const tagMatches = userContext.preferredTags.filter(tag => venue.tags.includes(tag));
        personalScore += tagMatches.length * 2;
      }

      // Boost venues near places user frequents
      if (userContext.frequentLocations && venue.coordinates) {
        const nearFrequentLocation = userContext.frequentLocations.some(location => {
          const distance = calculateDistance(location, {
            lat: venue.coordinates.latitude || venue.coordinates.lat,
            lng: venue.coordinates.longitude || venue.coordinates.lng
          });
          return distance && distance < 10; // Within 10km
        });
        if (nearFrequentLocation) personalScore += 3;
      }

      return {
        ...venue,
        personalScore,
        isPersonalized: true
      };
    });

    // Sort by personal score
    personalizedResults.sort((a, b) => b.personalScore - a.personalScore);

    return {
      ...baseResults,
      venues: personalizedResults.slice(0, filters.limit || 20),
      isPersonalized: true
    };
  } catch (error) {
    console.error('Error in personalized venue search:', error);
    // Fallback to regular search
    return combineVenueSearch(query, filters);
  }
};

/**
 * Helper function to calculate match score for search results
 */
const calculateMatchScore = (query, venue) => {
  if (!query) return 0;

  const queryLower = query.toLowerCase();
  let score = 0;

  // Exact name match gets highest score
  if (venue.name.toLowerCase() === queryLower) {
    score += 100;
  } else if (venue.name.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Description match
  if (venue.description && venue.description.toLowerCase().includes(queryLower)) {
    score += 25;
  }

  // Location match
  if (venue.address?.city && venue.address.city.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  // Category match
  if (venue.category && venue.category.toLowerCase().includes(queryLower)) {
    score += 40;
  }

  return score;
};

export default {
  searchVenuesByName,
  searchVenuesByLocation,
  searchVenuesByCategory,
  searchVenuesByTags,
  searchVenuesNearLocation,
  combineVenueSearch,
  getVenueSearchSuggestions,
  getPopularVenueSearches,
  searchVenuesWithPersonalization
};