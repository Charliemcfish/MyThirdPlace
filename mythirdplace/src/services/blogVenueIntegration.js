import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { enrichBlogWithAuthor } from './blog';

/**
 * Blog-Venue Integration Service
 * Handles the cross-platform relationships between blogs and venues
 */

/**
 * Link a blog to venues with relationship types
 * @param {string} blogId - Blog ID
 * @param {Array} venueRelationships - Array of {venueId, relationshipType, contextInBlog}
 * @returns {Promise} Promise that resolves when relationships are created
 */
export const linkBlogToVenues = async (blogId, venueRelationships) => {
  try {
    if (!venueRelationships || !Array.isArray(venueRelationships) || venueRelationships.length === 0) {
      return;
    }

    // Prepare venue relationship data with cached venue information
    const processedRelationships = await Promise.all(
      venueRelationships.map(async (relationship, index) => {
        try {
          // Get venue data for caching
          const venueData = await getVenueBasicInfo(relationship.venueId);

          return {
            venueId: relationship.venueId,
            relationshipType: relationship.relationshipType || 'mentioned',
            contextInBlog: relationship.contextInBlog || '',
            orderInBlog: index + 1,

            // Cached venue data for performance
            venueName: venueData?.name || '',
            venueCategory: venueData?.category || '',
            venueCity: venueData?.address?.city || '',
            venuePrimaryPhoto: venueData?.primaryPhotoURL || '',

            // Relationship metadata
            createdAt: Timestamp.now(),
            isActive: true
          };
        } catch (error) {
          console.error('Error processing venue relationship:', error);
          return null;
        }
      })
    );

    const validRelationships = processedRelationships.filter(r => r !== null);

    // Extract venue IDs and categories for blog document
    const linkedVenues = validRelationships.map(r => r.venueId);
    const venueCategories = [...new Set(validRelationships.map(r => r.venueCategory).filter(Boolean))];
    const primaryVenue = validRelationships.find(r => r.relationshipType === 'featured')?.venueId || linkedVenues[0];

    // Update blog document with venue relationships
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      linkedVenues: linkedVenues,
      venueRelationships: validRelationships,
      primaryVenue: primaryVenue,
      venueCategories: venueCategories,
      locationTags: validRelationships.map(r => r.venueCity).filter(Boolean),
      crossPlatformReferences: {
        mentionedVenues: linkedVenues,
        relatedVenues: [], // Could be populated by recommendation engine
        venueConnections: linkedVenues.length
      },
      updatedAt: Timestamp.now()
    });

  } catch (error) {
    console.error('Error linking blog to venues:', error);
    throw new Error('Failed to link blog to venues');
  }
};

/**
 * Get blogs about a specific venue
 * @param {string} venueId - Venue ID
 * @param {number} limitCount - Number of blogs to retrieve
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Promise that resolves with array of blogs
 */
export const getBlogsAboutVenue = async (venueId, limitCount = 6, filters = {}) => {
  try {
    let q = collection(db, 'blogs');

    const constraints = [
      where('isPublished', '==', true),
      where('linkedVenues', 'array-contains', venueId)
    ];

    if (filters.relationshipType) {
      // This would require a more complex query structure in production
      // For now, we'll filter client-side
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const blogs = [];

    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };

      // Client-side filter by relationship type if specified
      if (filters.relationshipType) {
        const hasRelationshipType = blogData.venueRelationships?.some(
          rel => rel.venueId === venueId && rel.relationshipType === filters.relationshipType
        );
        if (!hasRelationshipType) return;
      }

      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
    });

    // Enrich all blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;

  } catch (error) {
    console.error('Error getting blogs about venue:', error);
    throw new Error('Failed to get blogs about venue');
  }
};

/**
 * Get venues referenced in a blog
 * @param {string} blogId - Blog ID
 * @returns {Promise<Array>} Promise that resolves with array of venue data
 */
export const getVenuesInBlog = async (blogId) => {
  try {
    // Get blog data first
    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);

    if (!blogDoc.exists()) {
      throw new Error('Blog not found');
    }

    const blogData = blogDoc.data();
    const venueRelationships = blogData.venueRelationships || [];

    if (venueRelationships.length === 0) {
      return [];
    }

    // Get detailed venue data for each relationship
    const venues = await Promise.all(
      venueRelationships.map(async (relationship) => {
        try {
          const venueData = await getVenueBasicInfo(relationship.venueId);
          return {
            ...venueData,
            relationshipType: relationship.relationshipType,
            contextInBlog: relationship.contextInBlog,
            orderInBlog: relationship.orderInBlog
          };
        } catch (error) {
          console.error('Error getting venue data:', error);
          return null;
        }
      })
    );

    return venues.filter(venue => venue !== null)
                 .sort((a, b) => (a.orderInBlog || 0) - (b.orderInBlog || 0));

  } catch (error) {
    console.error('Error getting venues in blog:', error);
    throw new Error('Failed to get venues in blog');
  }
};

/**
 * Get blogs by venue category
 * @param {string} venueCategory - Venue category
 * @param {number} limitCount - Number of blogs to retrieve
 * @returns {Promise<Array>} Promise that resolves with array of blogs
 */
export const getBlogsByVenueCategory = async (venueCategory, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('isPublished', '==', true),
      where('venueCategories', 'array-contains', venueCategory),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const blogs = [];

    querySnapshot.forEach((doc) => {
      blogs.push({ id: doc.id, ...doc.data() });
    });

    return blogs;

  } catch (error) {
    console.error('Error getting blogs by venue category:', error);
    throw new Error('Failed to get blogs by venue category');
  }
};

/**
 * Search blogs and venues with unified results
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Promise that resolves with categorized results
 */
export const searchBlogsAndVenues = async (searchQuery, filters = {}) => {
  try {
    const results = {
      blogs: [],
      venues: [],
      crossReferences: []
    };

    if (!searchQuery || searchQuery.trim().length < 2) {
      return results;
    }

    const searchTerm = searchQuery.toLowerCase().trim();

    // Search blogs
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more for client-side filtering
    );

    const blogsSnapshot = await getDocs(blogsQuery);

    blogsSnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };

      const titleMatch = blogData.title.toLowerCase().includes(searchTerm);
      const contentMatch = blogData.content.toLowerCase().includes(searchTerm);
      const authorMatch = blogData.authorName?.toLowerCase().includes(searchTerm);
      const venueMatch = blogData.venueRelationships?.some(rel =>
        rel.venueName?.toLowerCase().includes(searchTerm)
      );

      if (titleMatch || contentMatch || authorMatch || venueMatch) {
        results.blogs.push(blogData);
      }
    });

    // Search venues (import venue search functionality)
    const { searchVenuesWithTags } = require('./venue');
    const venueResults = await searchVenuesWithTags(searchQuery, [], { limitCount: 50 });
    results.venues = venueResults.venues || [];

    // Find cross-references
    results.crossReferences = findCrossReferences(results.blogs, results.venues);

    return results;

  } catch (error) {
    console.error('Error in unified search:', error);
    throw new Error('Failed to search blogs and venues');
  }
};

/**
 * Get related blogs based on venue connections
 * @param {string} blogId - Current blog ID
 * @param {Array} venueIds - Venue IDs from current blog
 * @param {number} limitCount - Number of related blogs to retrieve
 * @returns {Promise<Array>} Promise that resolves with related blogs
 */
export const getRelatedBlogs = async (blogId, venueIds, limitCount = 6) => {
  try {
    if (!venueIds || venueIds.length === 0) {
      return [];
    }

    // Get blogs that reference any of the same venues
    const q = query(
      collection(db, 'blogs'),
      where('isPublished', '==', true),
      where('linkedVenues', 'array-contains-any', venueIds.slice(0, 10)), // Firestore limit
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Get more to filter out current blog
    );

    const querySnapshot = await getDocs(q);
    const relatedBlogs = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };

      // Exclude the current blog
      if (blogData.id !== blogId) {
        relatedBlogs.push(blogData);
      }
    });

    return relatedBlogs.slice(0, limitCount);

  } catch (error) {
    console.error('Error getting related blogs:', error);
    return [];
  }
};

/**
 * Get venue recommendations based on blog content
 * @param {string} blogId - Blog ID
 * @returns {Promise<Array>} Promise that resolves with recommended venues
 */
export const getVenueRecommendations = async (blogId) => {
  try {
    // This would use content analysis in production
    // For now, return venues from similar categories
    const blogData = await getBlogBasicInfo(blogId);

    if (!blogData || !blogData.venueCategories?.length) {
      return [];
    }

    const { getVenues } = require('./venue');
    const recommendations = [];

    // Get venues from same categories
    for (const category of blogData.venueCategories.slice(0, 3)) {
      try {
        const categoryVenues = await getVenues({
          category: category,
          limitCount: 5
        });

        recommendations.push(...(categoryVenues.venues || []));
      } catch (error) {
        console.error('Error getting category venues:', error);
      }
    }

    // Remove duplicates and venues already linked to blog
    const existingVenueIds = blogData.linkedVenues || [];
    const uniqueRecommendations = recommendations
      .filter((venue, index, arr) =>
        arr.findIndex(v => v.id === venue.id) === index &&
        !existingVenueIds.includes(venue.id)
      )
      .slice(0, 10);

    return uniqueRecommendations;

  } catch (error) {
    console.error('Error getting venue recommendations:', error);
    return [];
  }
};

/**
 * Update cached venue data in blog relationships
 * @param {string} venueId - Venue ID
 * @param {Object} venueData - Updated venue data
 * @returns {Promise} Promise that resolves when updates are complete
 */
export const updateVenueInBlogRelationships = async (venueId, venueData) => {
  try {
    // Find all blogs that reference this venue
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('linkedVenues', 'array-contains', venueId)
    );

    const blogsSnapshot = await getDocs(blogsQuery);

    const updatePromises = [];

    blogsSnapshot.forEach((doc) => {
      const blogData = doc.data();
      const venueRelationships = blogData.venueRelationships || [];

      // Update cached venue data in relationships
      const updatedRelationships = venueRelationships.map(rel => {
        if (rel.venueId === venueId) {
          return {
            ...rel,
            venueName: venueData.name || rel.venueName,
            venueCategory: venueData.category || rel.venueCategory,
            venueCity: venueData.address?.city || rel.venueCity,
            venuePrimaryPhoto: venueData.primaryPhotoURL || rel.venuePrimaryPhoto
          };
        }
        return rel;
      });

      updatePromises.push(
        updateDoc(doc.ref, {
          venueRelationships: updatedRelationships,
          updatedAt: Timestamp.now()
        })
      );
    });

    await Promise.all(updatePromises);

  } catch (error) {
    console.error('Error updating venue in blog relationships:', error);
    throw new Error('Failed to update venue in blog relationships');
  }
};

/**
 * Helper function to get basic venue information
 * @param {string} venueId - Venue ID
 * @returns {Promise<Object>} Promise that resolves with basic venue data
 */
const getVenueBasicInfo = async (venueId) => {
  try {
    const { getVenue } = require('./venue');
    return await getVenue(venueId);
  } catch (error) {
    console.error('Error getting venue basic info:', error);
    return null;
  }
};

/**
 * Helper function to get basic blog information
 * @param {string} blogId - Blog ID
 * @returns {Promise<Object>} Promise that resolves with basic blog data
 */
const getBlogBasicInfo = async (blogId) => {
  try {
    const { getBlog } = require('./blog');
    return await getBlog(blogId);
  } catch (error) {
    console.error('Error getting blog basic info:', error);
    return null;
  }
};

/**
 * Helper function to find cross-references between blogs and venues
 * @param {Array} blogs - Array of blog data
 * @param {Array} venues - Array of venue data
 * @returns {Array} Array of cross-reference objects
 */
const findCrossReferences = (blogs, venues) => {
  const crossRefs = [];

  blogs.forEach(blog => {
    if (blog.linkedVenues && blog.linkedVenues.length > 0) {
      blog.linkedVenues.forEach(venueId => {
        const venue = venues.find(v => v.id === venueId);
        if (venue) {
          crossRefs.push({
            type: 'blog-to-venue',
            blogId: blog.id,
            blogTitle: blog.title,
            venueId: venue.id,
            venueName: venue.name,
            relationshipType: 'linked'
          });
        }
      });
    }
  });

  return crossRefs;
};

export default {
  linkBlogToVenues,
  getBlogsAboutVenue,
  getVenuesInBlog,
  getBlogsByVenueCategory,
  searchBlogsAndVenues,
  getRelatedBlogs,
  getVenueRecommendations,
  updateVenueInBlogRelationships
};