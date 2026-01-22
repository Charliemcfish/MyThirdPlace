import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Search Indexing Service
 * Creates and manages optimized search indexes for venues and blogs
 */

/**
 * Generate search terms from text
 * @param {string} text - Input text to extract search terms from
 * @returns {Array} Array of searchable terms
 */
export const generateSearchTerms = (text) => {
  if (!text || typeof text !== 'string') return [];

  const terms = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(term => term.length > 2) // Only terms longer than 2 chars
    .filter(term => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(term)); // Filter common words

  return [...new Set(terms)]; // Remove duplicates
};

/**
 * Create venue search index
 * @param {Object} venue - Venue data
 * @returns {Object} Search index data
 */
export const createVenueSearchIndex = async (venue) => {
  try {
    const searchTerms = [
      ...generateSearchTerms(venue.name),
      ...generateSearchTerms(venue.description),
      ...generateSearchTerms(venue.address?.city || ''),
      ...generateSearchTerms(venue.address?.country || ''),
      venue.category?.toLowerCase()
    ].filter(Boolean);

    // Get regular count for popularity
    let regularCount = 0;
    try {
      const { getRegularCount } = require('./userVenueRelationships');
      regularCount = await getRegularCount(venue.id);
    } catch (error) {
      console.warn('Could not get regular count for venue:', venue.id);
    }

    const searchIndex = {
      id: venue.id,
      type: 'venue',
      name: venue.name.toLowerCase(),
      searchTerms: searchTerms,
      category: venue.category,
      tags: venue.tags || [],
      city: venue.address?.city?.toLowerCase() || '',
      country: venue.address?.country?.toLowerCase() || '',
      coordinates: venue.coordinates || null,
      isPublished: venue.isPublished !== false,
      regularCount: regularCount,
      createdAt: venue.createdAt || Timestamp.now(),
      lastUpdated: Timestamp.now(),

      // Additional data for rich search results
      primaryPhotoURL: venue.primaryPhotoURL || '',
      address: venue.address || {},
      isOwnerCreated: venue.isOwnerCreated || false,
      viewCount: venue.viewCount || 0
    };

    // Store in search index collection
    await setDoc(doc(db, 'searchIndex', `venue_${venue.id}`), searchIndex);

    return searchIndex;
  } catch (error) {
    console.error('Error creating venue search index:', error);
    throw error;
  }
};

/**
 * Create blog search index
 * @param {Object} blog - Blog data
 * @returns {Object} Search index data
 */
export const createBlogSearchIndex = async (blog) => {
  try {
    const searchTerms = [
      ...generateSearchTerms(blog.title),
      ...generateSearchTerms(blog.content?.substring(0, 1000) || ''), // First 1000 chars
      ...generateSearchTerms(blog.authorName),
      ...generateSearchTerms(blog.excerpt || ''),
      ...(blog.tags || []).map(tag => tag.toLowerCase())
    ].filter(Boolean);

    // Get venue names for cross-platform search
    const venueNames = [];
    if (blog.venueRelationships && Array.isArray(blog.venueRelationships)) {
      blog.venueRelationships.forEach(rel => {
        if (rel.venueName) {
          venueNames.push(rel.venueName.toLowerCase());
          searchTerms.push(...generateSearchTerms(rel.venueName));
        }
        if (rel.venueCity) {
          searchTerms.push(...generateSearchTerms(rel.venueCity));
        }
      });
    }

    const searchIndex = {
      id: blog.id,
      type: 'blog',
      title: blog.title.toLowerCase(),
      content: blog.content?.substring(0, 1000) || '', // Store first 1000 chars for snippet
      searchTerms: [...new Set(searchTerms)], // Remove duplicates
      category: blog.category,
      authorName: blog.authorName?.toLowerCase() || '',
      authorUID: blog.authorUID,
      linkedVenues: blog.linkedVenues || [],
      venueNames: venueNames,
      venueCategories: blog.venueCategories || [],
      isPublished: blog.isPublished === true,
      viewCount: blog.viewCount || 0,
      publishedAt: blog.publishedAt || blog.createdAt,
      createdAt: blog.createdAt || Timestamp.now(),
      lastUpdated: Timestamp.now(),

      // Additional data for rich search results
      excerpt: blog.excerpt || '',
      featuredImageURL: blog.featuredImageURL || '',
      readTime: blog.readTime || 0,
      tags: blog.tags || []
    };

    // Store in search index collection
    await setDoc(doc(db, 'searchIndex', `blog_${blog.id}`), searchIndex);

    return searchIndex;
  } catch (error) {
    console.error('Error creating blog search index:', error);
    throw error;
  }
};

/**
 * Update search index when content changes
 * @param {string} contentId - ID of content (venue or blog)
 * @param {string} contentType - 'venue' or 'blog'
 * @param {Object} contentData - Updated content data
 */
export const updateSearchIndex = async (contentId, contentType, contentData) => {
  try {
    if (contentType === 'venue') {
      await createVenueSearchIndex({ ...contentData, id: contentId });
    } else if (contentType === 'blog') {
      await createBlogSearchIndex({ ...contentData, id: contentId });
    }
  } catch (error) {
    console.error('Error updating search index:', error);
    throw error;
  }
};

/**
 * Delete search index entry
 * @param {string} contentId - ID of content
 * @param {string} contentType - 'venue' or 'blog'
 */
export const deleteSearchIndex = async (contentId, contentType) => {
  try {
    const indexId = `${contentType}_${contentId}`;
    await deleteDoc(doc(db, 'searchIndex', indexId));
  } catch (error) {
    console.error('Error deleting search index:', error);
    throw error;
  }
};

/**
 * Search venues using index
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Search filters
 * @param {number} limitCount - Number of results to return
 * @returns {Promise<Array>} Search results
 */
export const searchVenuesFromIndex = async (searchQuery, filters = {}, limitCount = 20) => {
  try {
    let q = collection(db, 'searchIndex');
    const constraints = [
      where('type', '==', 'venue'),
      where('isPublished', '==', true)
    ];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    // Apply tag filters (will need client-side filtering for array-contains-any)
    // Note: Firestore has limitations with complex array queries

    // Sort by relevance (regularCount for now, could be enhanced)
    if (filters.sortBy === 'popular') {
      constraints.push(orderBy('regularCount', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    constraints.push(limit(limitCount * 2)); // Get more for client-side filtering

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    let results = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let matchScore = 0;
      let matchedTerms = [];

      if (searchQuery && searchQuery.trim()) {
        const queryTerms = generateSearchTerms(searchQuery);

        // Calculate match score
        queryTerms.forEach(term => {
          if (data.name.includes(term)) {
            matchScore += 5; // Name matches are highest priority
            matchedTerms.push(term);
          } else if (data.searchTerms.includes(term)) {
            matchScore += 3; // General term matches
            matchedTerms.push(term);
          } else if (data.city.includes(term)) {
            matchScore += 2; // Location matches
            matchedTerms.push(term);
          }
        });

        // Only include results with matches if search query provided
        if (matchScore === 0) return;
      } else {
        matchScore = data.regularCount || 0; // Use popularity when no search query
      }

      // Apply tag filters client-side
      if (filters.tags && filters.tags.length > 0) {
        const hasTags = filters.tags.some(tag => data.tags.includes(tag));
        if (!hasTags) return;
      }

      results.push({
        ...data,
        matchScore,
        matchedTerms,
        distance: null // Will be calculated if user location available
      });
    });

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching venues from index:', error);
    throw error;
  }
};

/**
 * Search blogs using index
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Search filters
 * @param {number} limitCount - Number of results to return
 * @returns {Promise<Array>} Search results
 */
export const searchBlogsFromIndex = async (searchQuery, filters = {}, limitCount = 20) => {
  try {
    let q = collection(db, 'searchIndex');
    const constraints = [
      where('type', '==', 'blog'),
      where('isPublished', '==', true)
    ];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    // Apply author filter
    if (filters.authorUID) {
      constraints.push(where('authorUID', '==', filters.authorUID));
    }

    // Sort by relevance or date
    if (filters.sortBy === 'popular') {
      constraints.push(orderBy('viewCount', 'desc'));
    } else {
      constraints.push(orderBy('publishedAt', 'desc'));
    }

    constraints.push(limit(limitCount * 2)); // Get more for client-side filtering

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    let results = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let matchScore = 0;
      let matchedTerms = [];
      let snippet = data.excerpt || data.content.substring(0, 200) + '...';

      if (searchQuery && searchQuery.trim()) {
        const queryTerms = generateSearchTerms(searchQuery);

        // Calculate match score
        queryTerms.forEach(term => {
          if (data.title.includes(term)) {
            matchScore += 10; // Title matches are highest priority
            matchedTerms.push(term);
          } else if (data.searchTerms.includes(term)) {
            matchScore += 3; // General term matches
            matchedTerms.push(term);
          } else if (data.authorName.includes(term)) {
            matchScore += 5; // Author matches
            matchedTerms.push(term);
          } else if (data.venueNames.some(name => name.includes(term))) {
            matchScore += 4; // Venue name matches
            matchedTerms.push(term);
          }
        });

        // Only include results with matches if search query provided
        if (matchScore === 0) return;

        // Create snippet with highlighted terms
        snippet = createSearchSnippet(data.content, queryTerms);
      } else {
        matchScore = data.viewCount || 0; // Use popularity when no search query
      }

      // Apply date range filter
      if (filters.dateRange) {
        const publishedDate = data.publishedAt?.toDate?.() || new Date(data.publishedAt);
        const now = new Date();
        const daysSince = Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'week':
            if (daysSince > 7) return;
            break;
          case 'month':
            if (daysSince > 30) return;
            break;
          case 'year':
            if (daysSince > 365) return;
            break;
        }
      }

      results.push({
        ...data,
        matchScore,
        matchedTerms,
        snippet
      });
    });

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching blogs from index:', error);
    throw error;
  }
};

/**
 * Create search snippet with context
 * @param {string} content - Full content
 * @param {Array} searchTerms - Terms to highlight
 * @returns {string} Snippet with context
 */
const createSearchSnippet = (content, searchTerms) => {
  const maxLength = 200;
  const lowerContent = content.toLowerCase();

  // Find first occurrence of any search term
  let firstIndex = -1;
  for (const term of searchTerms) {
    const index = lowerContent.indexOf(term.toLowerCase());
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  if (firstIndex === -1) {
    return content.substring(0, maxLength) + '...';
  }

  // Create snippet around the found term
  const start = Math.max(0, firstIndex - 50);
  const end = Math.min(content.length, start + maxLength);

  let snippet = content.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
};

/**
 * Get search suggestions based on popular searches and index data
 * @param {string} partialQuery - Partial search query
 * @param {string} contentType - 'venue', 'blog', or 'all'
 * @returns {Promise<Array>} Search suggestions
 */
export const getSearchSuggestions = async (partialQuery, contentType = 'all') => {
  try {
    if (!partialQuery || partialQuery.length < 2) return [];

    const suggestions = new Set();
    const queryLower = partialQuery.toLowerCase();

    let q = collection(db, 'searchIndex');
    let constraints = [];

    if (contentType !== 'all') {
      constraints.push(where('type', '==', contentType));
    }

    constraints.push(limit(50)); // Get a sample for suggestions

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Check name/title
      if (data.name && data.name.includes(queryLower)) {
        suggestions.add(data.name);
      }
      if (data.title && data.title.includes(queryLower)) {
        suggestions.add(data.title);
      }

      // Check search terms
      data.searchTerms?.forEach(term => {
        if (term.startsWith(queryLower)) {
          suggestions.add(term);
        }
      });

      // Check location
      if (data.city && data.city.includes(queryLower)) {
        suggestions.add(data.city);
      }
    });

    return Array.from(suggestions).slice(0, 10); // Return top 10 suggestions
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

/**
 * Rebuild search index for all content (maintenance function)
 * @param {string} contentType - 'venue', 'blog', or 'all'
 */
export const rebuildSearchIndex = async (contentType = 'all') => {
  try {
    console.log('Starting search index rebuild for:', contentType);

    if (contentType === 'venue' || contentType === 'all') {
      const { getVenues } = require('./venue');
      const venues = await getVenues({ limitCount: 1000 });

      for (const venue of venues.venues) {
        await createVenueSearchIndex(venue);
      }
      console.log(`Rebuilt search index for ${venues.venues.length} venues`);
    }

    if (contentType === 'blog' || contentType === 'all') {
      const { getBlogs } = require('./blog');
      const blogs = await getBlogs(1, 1000);

      for (const blog of blogs.blogs) {
        await createBlogSearchIndex(blog);
      }
      console.log(`Rebuilt search index for ${blogs.blogs.length} blogs`);
    }

    console.log('Search index rebuild complete');
  } catch (error) {
    console.error('Error rebuilding search index:', error);
    throw error;
  }
};

export default {
  generateSearchTerms,
  createVenueSearchIndex,
  createBlogSearchIndex,
  updateSearchIndex,
  deleteSearchIndex,
  searchVenuesFromIndex,
  searchBlogsFromIndex,
  getSearchSuggestions,
  rebuildSearchIndex
};