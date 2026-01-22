/**
 * User-Venue Relationship Service
 * Handles the social networking features including "I am a Regular" functionality
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection name
const RELATIONSHIPS_COLLECTION = 'userVenueRelationships';

/**
 * Add a user as a regular at a venue
 * @param {string} userUID - User's Firebase UID
 * @param {string} venueId - Venue document ID
 * @param {Object} userData - Cached user data
 * @param {Object} venueData - Cached venue data
 * @returns {Promise<string>} - Relationship document ID
 */
export const addRegularRelationship = async (userUID, venueId, userData, venueData) => {
  try {
    // Check if relationship already exists
    const existingRelationship = await getExistingRelationship(userUID, venueId);
    if (existingRelationship) {
      // If relationship exists but is inactive, reactivate it
      if (!existingRelationship.isActive) {
        await updateDoc(doc(db, RELATIONSHIPS_COLLECTION, existingRelationship.id), {
          isActive: true,
          updatedAt: Timestamp.now(),
          userDisplayName: userData.displayName,
          userPhotoURL: userData.profilePhotoURL || null,
          venueName: venueData.name,
          venueCategory: venueData.category,
          venuePrimaryPhoto: venueData.photos?.[0] || null,
          venueCity: venueData.address?.city || null
        });
        return existingRelationship.id;
      }
      return existingRelationship.id;
    }

    // Create new relationship
    const relationshipData = {
      userUID,
      venueId,
      relationshipType: 'regular',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      source: 'web',

      // Cached user data for performance
      userDisplayName: userData.displayName || 'Anonymous User',
      userPhotoURL: userData.profilePhotoURL || null,

      // Cached venue data for performance
      venueName: venueData.name || 'Unknown Venue',
      venueCategory: venueData.category || 'Other',
      venuePrimaryPhoto: venueData.photos?.[0] || null,
      venueCity: venueData.address?.city || null
    };

    const docRef = await addDoc(collection(db, RELATIONSHIPS_COLLECTION), relationshipData);

    // Update user and venue statistics
    await updateUserStats(userUID);
    await updateVenueStats(venueId);

    return docRef.id;
  } catch (error) {
    console.error('Error adding regular relationship:', error);
    throw error;
  }
};

/**
 * Remove a user's regular status at a venue
 * @param {string} userUID - User's Firebase UID
 * @param {string} venueId - Venue document ID
 * @returns {Promise<boolean>} - Success status
 */
export const removeRegularRelationship = async (userUID, venueId) => {
  try {
    const existingRelationship = await getExistingRelationship(userUID, venueId);
    if (!existingRelationship) {
      return true; // Already not a regular
    }

    // Soft delete by setting isActive to false
    await updateDoc(doc(db, RELATIONSHIPS_COLLECTION, existingRelationship.id), {
      isActive: false,
      updatedAt: Timestamp.now()
    });

    // Update user and venue statistics
    await updateUserStats(userUID);
    await updateVenueStats(venueId);

    return true;
  } catch (error) {
    console.error('Error removing regular relationship:', error);
    throw error;
  }
};

/**
 * Check if a user is a regular at a specific venue
 * @param {string} userUID - User's Firebase UID
 * @param {string} venueId - Venue document ID
 * @returns {Promise<boolean>} - Whether user is a regular
 */
export const isUserRegularAtVenue = async (userUID, venueId) => {
  try {
    if (!userUID || !venueId) return false;

    const relationship = await getExistingRelationship(userUID, venueId);
    return relationship && relationship.isActive;
  } catch (error) {
    console.error('Error checking regular status:', error);
    return false;
  }
};

/**
 * Get all venues where a user is a regular
 * @param {string} userUID - User's Firebase UID
 * @param {number} limitCount - Maximum number of venues to return
 * @returns {Promise<Array>} - Array of venue relationships
 */
export const getUserRegularVenues = async (userUID, limitCount = 50) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('userUID', '==', userUID),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user regular venues:', error);
    return [];
  }
};

/**
 * Get all regular users for a specific venue
 * @param {string} venueId - Venue document ID
 * @param {number} limitCount - Maximum number of users to return
 * @returns {Promise<Array>} - Array of user relationships
 */
export const getVenueRegulars = async (venueId, limitCount = 100) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('venueId', '==', venueId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting venue regulars:', error);
    return [];
  }
};

/**
 * Get count of regular users for a venue
 * @param {string} venueId - Venue document ID
 * @returns {Promise<number>} - Count of regular users
 */
export const getRegularCount = async (venueId) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('venueId', '==', venueId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting regular count:', error);
    return 0;
  }
};

/**
 * Get regular status for multiple venues for a user
 * @param {string} userUID - User's Firebase UID
 * @param {Array<string>} venueIds - Array of venue IDs
 * @returns {Promise<Object>} - Object with venueId as key and boolean as value
 */
export const getUserRegularStatus = async (userUID, venueIds) => {
  try {
    if (!userUID || !venueIds || venueIds.length === 0) return {};

    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('userUID', '==', userUID),
      where('venueId', 'in', venueIds.slice(0, 10)), // Firestore 'in' limit is 10
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const statusMap = {};

    // Initialize all venues as not regular
    venueIds.forEach(venueId => {
      statusMap[venueId] = false;
    });

    // Set true for venues where user is regular
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      statusMap[data.venueId] = true;
    });

    return statusMap;
  } catch (error) {
    console.error('Error getting user regular status:', error);
    return {};
  }
};

/**
 * Get popular venues based on regular count
 * @param {number} limitCount - Maximum number of venues to return
 * @returns {Promise<Array>} - Array of popular venues with regular counts
 */
export const getPopularVenues = async (limitCount = 20) => {
  try {
    // This is a simplified approach - in a real app you'd want to maintain
    // a separate collection or use Firestore aggregation
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const venueRegularCounts = {};

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const venueId = data.venueId;

      if (!venueRegularCounts[venueId]) {
        venueRegularCounts[venueId] = {
          venueId,
          venueName: data.venueName,
          venueCategory: data.venueCategory,
          venuePrimaryPhoto: data.venuePrimaryPhoto,
          venueCity: data.venueCity,
          regularCount: 0
        };
      }
      venueRegularCounts[venueId].regularCount++;
    });

    // Sort by regular count and return top venues
    return Object.values(venueRegularCounts)
      .sort((a, b) => b.regularCount - a.regularCount)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting popular venues:', error);
    return [];
  }
};

/**
 * Get community statistics
 * @returns {Promise<Object>} - Community statistics
 */
export const getCommunityStats = async () => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const uniqueUsers = new Set();
    const uniqueVenues = new Set();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      uniqueUsers.add(data.userUID);
      uniqueVenues.add(data.venueId);
    });

    return {
      totalRelationships: querySnapshot.size,
      activeUsers: uniqueUsers.size,
      venuesWithRegulars: uniqueVenues.size
    };
  } catch (error) {
    console.error('Error getting community stats:', error);
    return {
      totalRelationships: 0,
      activeUsers: 0,
      venuesWithRegulars: 0
    };
  }
};

/**
 * Update cached user data across all relationships
 * @param {string} userUID - User's Firebase UID
 * @param {Object} userData - Updated user data
 * @returns {Promise<void>}
 */
export const updateCachedUserData = async (userUID, userData) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('userUID', '==', userUID),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach(doc => {
      const docRef = doc.ref;
      batch.update(docRef, {
        userDisplayName: userData.displayName || 'Anonymous User',
        userPhotoURL: userData.profilePhotoURL || null,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error updating cached user data:', error);
    throw error;
  }
};

/**
 * Update cached venue data across all relationships
 * @param {string} venueId - Venue document ID
 * @param {Object} venueData - Updated venue data
 * @returns {Promise<void>}
 */
export const updateCachedVenueData = async (venueId, venueData) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('venueId', '==', venueId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach(doc => {
      const docRef = doc.ref;
      batch.update(docRef, {
        venueName: venueData.name || 'Unknown Venue',
        venueCategory: venueData.category || 'Other',
        venuePrimaryPhoto: venueData.photos?.[0] || null,
        venueCity: venueData.address?.city || null,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error updating cached venue data:', error);
    throw error;
  }
};

/**
 * Helper function to get existing relationship
 * @param {string} userUID - User's Firebase UID
 * @param {string} venueId - Venue document ID
 * @returns {Promise<Object|null>} - Existing relationship or null
 */
const getExistingRelationship = async (userUID, venueId) => {
  try {
    const q = query(
      collection(db, RELATIONSHIPS_COLLECTION),
      where('userUID', '==', userUID),
      where('venueId', '==', venueId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting existing relationship:', error);
    return null;
  }
};

/**
 * Update user statistics (placeholder for future implementation)
 * @param {string} userUID - User's Firebase UID
 * @returns {Promise<void>}
 */
const updateUserStats = async (userUID) => {
  try {
    // This would update user document with social stats
    // Implementation depends on user service structure
    console.log('Updating user stats for:', userUID);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

/**
 * Update venue statistics (placeholder for future implementation)
 * @param {string} venueId - Venue document ID
 * @returns {Promise<void>}
 */
const updateVenueStats = async (venueId) => {
  try {
    // This would update venue document with regular count
    // Implementation depends on venue service structure
    console.log('Updating venue stats for:', venueId);
  } catch (error) {
    console.error('Error updating venue stats:', error);
  }
};

/**
 * Activity tracking function
 * @param {string} userUID - User's Firebase UID
 * @param {string} venueId - Venue document ID
 * @param {string} action - Action performed ('add' or 'remove')
 * @returns {Promise<void>}
 */
export const trackRegularActivity = async (userUID, venueId, action) => {
  try {
    // Log activity for future analytics
    console.log(`User ${userUID} ${action} regular status for venue ${venueId}`);

    // This could be expanded to save to an activities collection
    // for building activity feeds and analytics
  } catch (error) {
    console.error('Error tracking regular activity:', error);
  }
};