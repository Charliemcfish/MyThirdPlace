import { calculateDistance, geocodeAddress, getUserLocation } from './geocoding';
import { searchVenuesFromIndex } from './searchIndexing';
import { combineVenueSearch } from './venueSearch';
import { combineBlogSearch } from './blogSearch';

/**
 * Location-Based Search Service
 * Provides location-aware search functionality with distance calculations and sorting
 */

/**
 * Search content near specific coordinates
 * @param {Object} coordinates - { lat, lng } coordinates
 * @param {number} radius - Search radius in kilometers
 * @param {string} contentType - 'venue', 'blog', or 'all'
 * @param {Object} filters - Additional search filters
 * @returns {Promise<Object>} Location-based search results
 */
export const searchNearLocation = async (coordinates, radius = 25, contentType = 'all', filters = {}) => {
  try {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      throw new Error('Valid coordinates required for location search');
    }

    const results = { venues: [], blogs: [], totalResults: 0 };

    // Search venues if requested
    if (contentType === 'venue' || contentType === 'all') {
      const venueFilters = {
        ...filters,
        coordinates: coordinates,
        maxDistance: radius,
        sortBy: 'distance'
      };

      const venueResults = await combineVenueSearch('', venueFilters, 50);
      results.venues = venueResults.venues || [];
    }

    // Search blogs if requested (based on venue locations they reference)
    if (contentType === 'blog' || contentType === 'all') {
      const blogFilters = {
        ...filters,
        hasVenues: true,
        sortBy: 'recent'
      };

      const blogResults = await combineBlogSearch('', blogFilters, 50);

      // Filter blogs by venue locations (approximate)
      const locationFilteredBlogs = [];
      for (const blog of blogResults.blogs || []) {
        if (blog.venueRelationships && Array.isArray(blog.venueRelationships)) {
          // This is a simplified approach - in production, you'd have venue coordinates
          // cached in blog relationships for better performance
          locationFilteredBlogs.push({
            ...blog,
            estimatedDistance: null // Would calculate from linked venues
          });
        }
      }

      results.blogs = locationFilteredBlogs.slice(0, 25);
    }

    results.totalResults = results.venues.length + results.blogs.length;

    return {
      ...results,
      searchLocation: coordinates,
      searchRadius: radius,
      locationName: await getLocationName(coordinates)
    };
  } catch (error) {
    console.error('Error searching near location:', error);
    throw new Error('Failed to search near location');
  }
};

/**
 * Search within a specific city
 * @param {string} cityName - City name to search in
 * @param {string} contentType - 'venue', 'blog', or 'all'
 * @param {Object} filters - Additional search filters
 * @returns {Promise<Object>} City-based search results
 */
export const searchByCity = async (cityName, contentType = 'all', filters = {}) => {
  try {
    if (!cityName || cityName.trim().length < 2) {
      throw new Error('Valid city name required');
    }

    const results = { venues: [], blogs: [], totalResults: 0 };

    // Search venues in city
    if (contentType === 'venue' || contentType === 'all') {
      const venueFilters = {
        ...filters,
        sortBy: 'popular'
      };

      const venueResults = await combineVenueSearch(cityName, venueFilters, 50);

      // Filter results to only include venues actually in the city
      results.venues = (venueResults.venues || []).filter(venue =>
        venue.city && venue.city.toLowerCase().includes(cityName.toLowerCase())
      );
    }

    // Search blogs mentioning the city or venues in the city
    if (contentType === 'blog' || contentType === 'all') {
      const blogFilters = {
        ...filters,
        sortBy: 'relevance'
      };

      const blogResults = await combineBlogSearch(cityName, blogFilters, 30);
      results.blogs = blogResults.blogs || [];
    }

    results.totalResults = results.venues.length + results.blogs.length;

    return {
      ...results,
      searchCity: cityName,
      cityCoordinates: await getCityCoordinates(cityName)
    };
  } catch (error) {
    console.error('Error searching by city:', error);
    throw new Error('Failed to search by city');
  }
};

/**
 * Search by postcode with radius
 * @param {string} postcode - Postcode to search near
 * @param {number} radius - Search radius in kilometers
 * @param {string} contentType - 'venue', 'blog', or 'all'
 * @param {Object} filters - Additional search filters
 * @returns {Promise<Object>} Postcode-based search results
 */
export const searchByPostcode = async (postcode, radius = 10, contentType = 'all', filters = {}) => {
  try {
    if (!postcode || postcode.trim().length < 3) {
      throw new Error('Valid postcode required');
    }

    // Geocode the postcode to get coordinates
    const geocodeResult = await geocodeAddress(postcode);
    if (!geocodeResult || !geocodeResult.coordinates) {
      throw new Error('Could not find location for postcode');
    }

    // Use coordinate-based search
    const results = await searchNearLocation(
      geocodeResult.coordinates,
      radius,
      contentType,
      filters
    );

    return {
      ...results,
      searchPostcode: postcode,
      postcodeLocation: geocodeResult.formatted_address
    };
  } catch (error) {
    console.error('Error searching by postcode:', error);
    throw new Error('Failed to search by postcode');
  }
};

/**
 * Get popular content in a specific location
 * @param {Object} coordinates - { lat, lng } coordinates
 * @param {number} radius - Search radius in kilometers
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Popular content in location
 */
export const getPopularInLocation = async (coordinates, radius = 50, options = {}) => {
  try {
    const { timeframe = 'month', limit = 20 } = options;

    // Get popular venues near location
    const venueFilters = {
      coordinates: coordinates,
      maxDistance: radius,
      sortBy: 'popular',
      popularOnly: true
    };

    const popularVenues = await combineVenueSearch('', venueFilters, limit);

    // Get popular blogs about venues in the area
    const blogFilters = {
      hasVenues: true,
      sortBy: 'popular',
      dateRange: timeframe
    };

    const popularBlogs = await combineBlogSearch('', blogFilters, limit);

    return {
      venues: popularVenues.venues || [],
      blogs: popularBlogs.blogs || [],
      location: coordinates,
      radius: radius,
      timeframe: timeframe,
      locationName: await getLocationName(coordinates)
    };
  } catch (error) {
    console.error('Error getting popular content in location:', error);
    throw new Error('Failed to get popular content in location');
  }
};

/**
 * Get trending content in a specific location
 * @param {Object} coordinates - { lat, lng } coordinates
 * @param {number} radius - Search radius in kilometers
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Trending content in location
 */
export const getTrendingInLocation = async (coordinates, radius = 25, options = {}) => {
  try {
    const { timeframe = 'week', limit = 15 } = options;

    // Get recently popular venues (simplified trending algorithm)
    const venueFilters = {
      coordinates: coordinates,
      maxDistance: radius,
      sortBy: 'recent',
      dateRange: timeframe
    };

    const trendingVenues = await combineVenueSearch('', venueFilters, limit);

    // Get recently popular blogs
    const blogFilters = {
      hasVenues: true,
      sortBy: 'popular',
      dateRange: timeframe
    };

    const trendingBlogs = await combineBlogSearch('', blogFilters, limit);

    return {
      venues: trendingVenues.venues || [],
      blogs: trendingBlogs.blogs || [],
      location: coordinates,
      radius: radius,
      timeframe: timeframe,
      locationName: await getLocationName(coordinates)
    };
  } catch (error) {
    console.error('Error getting trending content in location:', error);
    throw new Error('Failed to get trending content in location');
  }
};

/**
 * Calculate distances for an array of content items
 * @param {Object} userLocation - User's coordinates
 * @param {Array} contentArray - Array of venues or blogs
 * @returns {Array} Content with distance property added
 */
export const calculateDistances = (userLocation, contentArray) => {
  if (!userLocation || !Array.isArray(contentArray)) {
    return contentArray;
  }

  return contentArray.map(item => {
    let distance = null;

    if (item.coordinates) {
      distance = calculateDistance(userLocation, {
        lat: item.coordinates.latitude || item.coordinates.lat,
        lng: item.coordinates.longitude || item.coordinates.lng
      });
    } else if (item.venueRelationships && Array.isArray(item.venueRelationships)) {
      // For blogs, try to calculate distance to first linked venue
      // This is approximate and would be better with cached venue coordinates
      distance = null; // Would calculate from venue coordinates
    }

    return {
      ...item,
      distance: distance,
      distanceFormatted: distance ? formatDistance(distance) : null
    };
  });
};

/**
 * Sort content by distance from user location
 * @param {Array} contentArray - Array of content items
 * @param {Object} userLocation - User's coordinates
 * @returns {Array} Content sorted by distance (closest first)
 */
export const sortByDistance = (contentArray, userLocation) => {
  if (!userLocation || !Array.isArray(contentArray)) {
    return contentArray;
  }

  const withDistances = calculateDistances(userLocation, contentArray);

  return withDistances.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
};

/**
 * Filter content within a maximum distance
 * @param {Array} contentArray - Array of content items
 * @param {number} maxDistance - Maximum distance in kilometers
 * @returns {Array} Filtered content within distance
 */
export const filterByDistance = (contentArray, maxDistance) => {
  if (!maxDistance || !Array.isArray(contentArray)) {
    return contentArray;
  }

  return contentArray.filter(item =>
    item.distance === null || item.distance <= maxDistance
  );
};

/**
 * Get location suggestions for search
 * @param {string} partialLocation - Partial location string
 * @returns {Promise<Array>} Location suggestions
 */
export const getLocationSuggestions = async (partialLocation) => {
  try {
    if (!partialLocation || partialLocation.length < 2) {
      return [];
    }

    // This would integrate with a geocoding service for real suggestions
    // For now, return some example UK locations
    const commonLocations = [
      'London, UK',
      'Manchester, UK',
      'Birmingham, UK',
      'Bristol, UK',
      'Leeds, UK',
      'Liverpool, UK',
      'Sheffield, UK',
      'Newcastle, UK',
      'Nottingham, UK',
      'Edinburgh, UK'
    ];

    const filtered = commonLocations.filter(location =>
      location.toLowerCase().includes(partialLocation.toLowerCase())
    );

    return filtered.slice(0, 8).map(location => ({
      name: location,
      type: 'city',
      icon: '🏙️'
    }));
  } catch (error) {
    console.error('Error getting location suggestions:', error);
    return [];
  }
};

/**
 * Get user's current location and search nearby
 * @param {string} contentType - 'venue', 'blog', or 'all'
 * @param {number} radius - Search radius in kilometers
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Nearby search results
 */
export const searchNearMe = async (contentType = 'all', radius = 25, filters = {}) => {
  try {
    const userLocation = await getUserLocation();

    if (!userLocation) {
      throw new Error('Unable to get your location. Please enable location services.');
    }

    const results = await searchNearLocation(userLocation, radius, contentType, filters);

    return {
      ...results,
      userLocation: userLocation,
      isNearMeSearch: true
    };
  } catch (error) {
    console.error('Error searching near me:', error);
    throw error;
  }
};

/**
 * Helper Functions
 */

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance
 */
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

/**
 * Get location name from coordinates (simplified)
 * @param {Object} coordinates - { lat, lng }
 * @returns {Promise<string>} Location name
 */
const getLocationName = async (coordinates) => {
  try {
    // This would do reverse geocoding in a real implementation
    return `${coordinates.lat.toFixed(2)}, ${coordinates.lng.toFixed(2)}`;
  } catch (error) {
    return 'Unknown location';
  }
};

/**
 * Get coordinates for a city name (simplified)
 * @param {string} cityName - City name
 * @returns {Promise<Object>} City coordinates
 */
const getCityCoordinates = async (cityName) => {
  try {
    const geocodeResult = await geocodeAddress(cityName);
    return geocodeResult?.coordinates || null;
  } catch (error) {
    console.error('Error getting city coordinates:', error);
    return null;
  }
};

export default {
  searchNearLocation,
  searchByCity,
  searchByPostcode,
  getPopularInLocation,
  getTrendingInLocation,
  calculateDistances,
  sortByDistance,
  filterByDistance,
  getLocationSuggestions,
  searchNearMe
};