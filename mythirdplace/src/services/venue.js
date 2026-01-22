import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';
import { db, storage } from './firebase';
import geocodingService from './geocoding';
import { processAllSocialMediaLinks, validateSocialMediaData } from './socialMedia';
import { venueTags, validateSelectedTags } from '../data/venueTags.js';
import { compressVenuePhoto } from '../utils/imageCompression';

/**
 * Base Categories - Predefined categories for venue classification
 */
export const baseCategories = [
  { id: 'cafe', name: 'Cafe', icon: '☕' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'gym', name: 'Gym', icon: '💪' },
  { id: 'sauna', name: 'Sauna', icon: '🧖' },
  { id: 'coworking', name: 'Co-working Space', icon: '💼' },
  { id: 'community-center', name: 'Community Center', icon: '🏛️' },
  { id: 'cultural-hub', name: 'Cultural Hub', icon: '🎭' },
  { id: 'park', name: 'Park', icon: '🌳' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'pub', name: 'Pub', icon: '🍺' },
  { id: 'bookstore', name: 'Bookstore', icon: '📖' },
  { id: 'art-gallery', name: 'Art Gallery', icon: '🎨' },
  { id: 'other', name: 'Other', icon: '📍' }
];

// Dynamic categories loaded from database
let dynamicCategories = [];

/**
 * Get all venue categories (base + dynamic)
 */
export const venueCategories = () => [...baseCategories, ...dynamicCategories];

/**
 * Get category information by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryById = (categoryId) => {
  return venueCategories().find(category => category.id === categoryId) || null;
};

/**
 * Load dynamic categories from Firestore
 */
export const loadDynamicCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoriesQuery = query(categoriesRef, orderBy('usageCount', 'desc'));
    const snapshot = await getDocs(categoriesQuery);

    dynamicCategories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return dynamicCategories;
  } catch (error) {
    console.error('Error loading dynamic categories:', error);
    return [];
  }
};

/**
 * Add a new custom category
 * @param {Object} categoryData - Category information
 * @returns {Promise<string>} Category ID
 */
export const addCustomCategory = async (categoryData) => {
  try {
    const { name, icon } = categoryData;

    // Create category ID from name
    const id = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if category already exists
    const existingCategory = getCategoryById(id);
    if (existingCategory) {
      throw new Error('Category already exists');
    }

    const newCategory = {
      id,
      name,
      icon,
      usageCount: 1,
      createdAt: serverTimestamp(),
      isCustom: true
    };

    // Add to Firestore
    const categoriesRef = collection(db, 'categories');
    await addDoc(categoriesRef, newCategory);

    // Add to local array
    dynamicCategories.push(newCategory);

    return id;
  } catch (error) {
    console.error('Error adding custom category:', error);
    throw error;
  }
};

/**
 * Increment category usage count
 * @param {string} categoryId - Category ID
 */
export const incrementCategoryUsage = async (categoryId) => {
  try {
    // Only increment for custom categories
    const category = getCategoryById(categoryId);
    if (!category || !category.isCustom) return;

    const categoriesRef = collection(db, 'categories');
    const categoryQuery = query(categoriesRef, where('id', '==', categoryId));
    const snapshot = await getDocs(categoryQuery);

    if (!snapshot.empty) {
      const categoryDoc = snapshot.docs[0];
      await updateDoc(categoryDoc.ref, {
        usageCount: increment(1)
      });
    }
  } catch (error) {
    console.error('Error incrementing category usage:', error);
  }
};

/**
 * Create a new venue listing with enhanced features
 * @param {Object} venueData - Enhanced venue information including ownership, tags, contact info
 * @param {Array} photoFiles - Array of photo files to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} Promise that resolves with venue ID
 */
export const createEnhancedVenue = async (venueData, photoFiles = [], onProgress = null) => {
  try {
    // Validate venue data
    const validation = validateVenueData(venueData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    // Validate photos
    if (photoFiles.length === 0) {
      throw new Error('At least one photo is required');
    }

    if (photoFiles.length > 10) {
      throw new Error('Maximum 10 photos allowed per venue');
    }

    // Handle address geocoding
    let addressData = {
      street: venueData.address.street,
      city: venueData.address.city,
      postcode: venueData.address.postcode || '',
      country: venueData.address.country,
      fullAddress: venueData.address.fullAddress || formatAddress(venueData.address)
    };

    let coordinates = null;
    let geocodingData = null;

    // Use provided coordinates if available (from AddressInput)
    if (venueData.address.coordinates) {
      coordinates = venueData.address.coordinates;
      geocodingData = {
        placeId: venueData.address.placeId,
        geocodedAt: venueData.address.geocodedAt || new Date().toISOString(),
        method: 'autocomplete'
      };
    } else {
      // Try to geocode the address
      try {
        const geocodeResult = await geocodingService.geocodeAddress(addressData.fullAddress);
        coordinates = geocodeResult.coordinates;
        geocodingData = {
          formatted_address: geocodeResult.formatted_address,
          placeId: geocodeResult.place_id,
          addressComponents: geocodeResult.address_components,
          geocodedAt: new Date().toISOString(),
          method: 'manual_geocoding'
        };
        
        // Update address with geocoded data if more complete
        if (geocodeResult.formatted_address) {
          addressData.fullAddress = geocodeResult.formatted_address;
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed for venue:', geocodeError);
        // Continue without coordinates - can be geocoded later
      }
    }

    // Process enhanced data
    const isOwnerCreated = venueData.ownershipType === 'owner';
    const processedTags = venueData.tags || [];
    const processedSocialMedia = venueData.socialMedia ? processAllSocialMediaLinks(venueData.socialMedia) : {};
    
    // Validate enhanced data
    if (processedTags.length > 0 && !validateSelectedTags(processedTags)) {
      throw new Error('Invalid tags selected');
    }
    
    // No validation for social media - we accept any URL format now
    
    // Process multiple locations if provided
    let processedAdditionalLocations = [];
    if (venueData.hasMultipleLocations && venueData.additionalLocations) {
      processedAdditionalLocations = await processMultipleLocations(venueData.additionalLocations);
    }

    // Create venue document first
    const venueRef = await addDoc(collection(db, 'venues'), {
      name: venueData.name,
      description: venueData.description,
      category: venueData.category,
      address: addressData,
      coordinates: coordinates,
      geocoding: geocodingData,
      photos: [], // Will be updated after photo uploads
      primaryPhotoURL: '', // Will be set to first photo
      createdBy: venueData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: true,
      isVerified: false,
      viewCount: 0,
      
      // Enhanced fields
      isOwnerCreated: isOwnerCreated,
      createdByOwner: isOwnerCreated,
      creationPath: venueData.ownershipType || 'visitor',
      tags: processedTags,
      tagsList: processedTags.map(tagId => {
        const tag = venueTags.find(t => t.id === tagId);
        return tag ? { id: tag.id, name: tag.name, category: tag.category } : null;
      }).filter(Boolean),
      contactInfo: isOwnerCreated ? (venueData.contactInfo || {}) : {},
      socialMedia: processedSocialMedia,
      
      // Multiple locations
      hasMultipleLocations: venueData.hasMultipleLocations || false,
      additionalLocations: processedAdditionalLocations,
      isChain: (processedAdditionalLocations.length > 0),
      chainName: venueData.chainName || '',
      
      // Verification and metadata
      verificationRequested: false,
      verificationStatus: 'none',
      lastUpdated: serverTimestamp(),
      updatedBy: venueData.createdBy,
      isPubliclyVisible: true,
      contactInfoPublic: isOwnerCreated
    });

    const venueId = venueRef.id;

    // Upload photos
    const photoURLs = await uploadVenuePhotos(venueId, photoFiles, onProgress);

    // Update venue with photo URLs
    await updateDoc(venueRef, {
      photos: photoURLs,
      primaryPhotoURL: photoURLs[0] || '',
      updatedAt: serverTimestamp()
    });

    // Increment category usage if it's a custom category
    await incrementCategoryUsage(venueData.category);

    return venueId;
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
};

/**
 * Upload multiple photos for a venue
 * @param {string} venueId - Venue ID
 * @param {Array} photoFiles - Array of photo files
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Array>} Promise that resolves with array of photo URLs
 */
export const uploadVenuePhotos = async (venueId, photoFiles, onProgress = null) => {
  try {
    const photoURLs = [];
    const totalFiles = photoFiles.length;

    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];

      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
      }

      // Compress image before upload
      const compressedFile = await compressVenuePhoto(file);

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `photo_${i + 1}_${timestamp}.jpg`; // Always save as JPEG after compression
      const storagePath = `venues/${venueId}/photos/${fileName}`;
      const storageRef = ref(storage, storagePath);

      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);
        
        const photoURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress = ((i / totalFiles) + (progress / 100 / totalFiles)) * 100;
              onProgress(Math.round(overallProgress));
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });

        photoURLs.push(photoURL);
      } else {
        // Simple upload without progress
        const snapshot = await uploadBytes(storageRef, compressedFile);
        const photoURL = await getDownloadURL(snapshot.ref);
        photoURLs.push(photoURL);
      }
    }

    return photoURLs;
  } catch (error) {
    console.error('Error uploading venue photos:', error);
    throw error;
  }
};

/**
 * Get a single venue by ID
 * @param {string} venueId - Venue ID
 * @returns {Promise<Object|null>} Promise that resolves with venue data
 */
export const getVenue = async (venueId) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    const venueSnap = await getDoc(venueRef);
    
    if (venueSnap.exists()) {
      return {
        id: venueSnap.id,
        ...venueSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting venue:', error);
    throw error;
  }
};

/**
 * Simple test function to check Firestore connection
 * @returns {Promise<Array>} Promise that resolves with raw venue documents
 */
export const testGetAllVenues = async () => {
  try {
    console.log('Testing direct Firestore connection...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    console.log('Raw snapshot size:', snapshot.size);
    const venues = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Raw venue doc:', {
        id: doc.id,
        name: data.name,
        category: data.category,
        isPublished: data.isPublished,
        createdAt: data.createdAt
      });
      venues.push({ id: doc.id, ...data });
    });
    
    return venues;
  } catch (error) {
    console.error('Test query failed:', error);
    throw error;
  }
};

/**
 * Debug function to test category filtering
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Promise that resolves with filtered venues
 */
export const testCategoryFiltering = async (category) => {
  try {
    console.log('Testing category filtering for:', category);
    
    // Try simple category-only query first
    const venuesRef = collection(db, 'venues');
    let testQuery;
    
    if (category && category !== 'all') {
      testQuery = query(venuesRef, where('category', '==', category));
    } else {
      testQuery = venuesRef;
    }
    
    const snapshot = await getDocs(testQuery);
    console.log('Category filter test - snapshot size:', snapshot.size);
    
    const venues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Filtered venue:', {
        id: doc.id,
        name: data.name,
        category: data.category
      });
      venues.push({ id: doc.id, ...data });
    });
    
    return venues;
  } catch (error) {
    console.error('Category filtering test failed:', error);
    throw error;
  }
};

/**
 * Get venues with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Promise that resolves with venues and pagination info
 */
export const getVenues = async (options = {}) => {
  try {
    const {
      page = 1,
      limitCount = 20,
      category = null,
      createdBy = null,
      lastVenue = null
    } = options;

    console.log('getVenues called with options:', options);

    let venuesQuery = collection(db, 'venues');
    let useClientSideFiltering = false;

    // Build query based on filters
    try {
      if (category && category !== 'all') {
        console.log('Attempting server-side category filter:', category);
        if (createdBy) {
          // Multiple filters - might need composite index
          venuesQuery = query(
            venuesQuery, 
            where('category', '==', category),
            where('createdBy', '==', createdBy),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
          );
        } else {
          // Single category filter
          venuesQuery = query(
            venuesQuery, 
            where('category', '==', category),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
          );
        }
      } else if (createdBy) {
        // Only creator filter
        venuesQuery = query(
          venuesQuery, 
          where('createdBy', '==', createdBy),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        // No filters, just get all venues
        venuesQuery = query(
          venuesQuery, 
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
    } catch (queryError) {
      console.log('Query construction failed, will use client-side filtering:', queryError);
      useClientSideFiltering = true;
      // Fallback: get all venues and filter client-side
      venuesQuery = query(
        collection(db, 'venues'),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 3) // Get more to account for filtering
      );
    }

    console.log('Executing query...');
    let querySnapshot;
    
    try {
      querySnapshot = await getDocs(venuesQuery);
      console.log('Query snapshot size:', querySnapshot.size);
    } catch (queryExecutionError) {
      console.log('Query execution failed, falling back to client-side filtering:', queryExecutionError);
      useClientSideFiltering = true;
      // Fallback: get all venues and filter client-side
      venuesQuery = query(
        collection(db, 'venues'),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 3) // Get more to account for filtering
      );
      querySnapshot = await getDocs(venuesQuery);
      console.log('Fallback query snapshot size:', querySnapshot.size);
    }
    
    let venues = [];
    
    querySnapshot.forEach((doc) => {
      const venueData = {
        id: doc.id,
        ...doc.data()
      };
      venues.push(venueData);
    });

    // Apply client-side filtering if server-side failed
    if (useClientSideFiltering) {
      console.log('Applying client-side category filter for:', category);
      if (category && category !== 'all') {
        venues = venues.filter(venue => {
          console.log(`Checking venue ${venue.name}: category ${venue.category} === ${category}?`);
          return venue.category === category;
        });
      }
      
      if (createdBy) {
        venues = venues.filter(venue => venue.createdBy === createdBy);
      }

      // Sort by creation date (most recent first)
      venues.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime;
      });

      // Limit results
      venues = venues.slice(0, limitCount);
    }

    console.log('Total venues after filtering:', venues.length);
    venues.forEach(v => console.log(`Final venue: ${v.name} (${v.category})`));

    return {
      venues,
      hasMore: venues.length === limitCount,
      lastVenue: venues.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error('Error getting venues:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Get venues created by a specific user
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of venues to retrieve
 * @returns {Promise<Array>} Promise that resolves with array of venues
 */
export const getUserVenues = async (userId, limitCount = 20) => {
  try {
    const result = await getVenues({
      createdBy: userId,
      limitCount
    });
    
    return result.venues;
  } catch (error) {
    console.error('Error getting user venues:', error);
    throw error;
  }
};

/**
 * Update venue information
 * @param {string} venueId - Venue ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateVenue = async (venueId, updateData) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    
    // Format address if address data is provided
    if (updateData.address) {
      updateData.address.fullAddress = formatAddress(updateData.address);
    }
    
    await updateDoc(venueRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
};

/**
 * Delete a venue and its associated photos
 * @param {string} venueId - Venue ID
 * @returns {Promise} Promise that resolves when deletion is complete
 */
export const deleteVenue = async (venueId) => {
  try {
    // Get venue data to access photo URLs
    const venue = await getVenue(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    // Delete all photos from storage
    if (venue.photos && venue.photos.length > 0) {
      await Promise.all(venue.photos.map(async (photoURL) => {
        try {
          // Extract file path from URL
          const pathMatch = photoURL.match(/venues%2F[^?]+/);
          if (pathMatch) {
            const decodedPath = decodeURIComponent(pathMatch[0]);
            const photoRef = ref(storage, decodedPath);
            await deleteObject(photoRef);
          }
        } catch (error) {
          console.error('Error deleting photo:', error);
          // Continue with other deletions even if one fails
        }
      }));
    }

    // Delete venue document
    const venueRef = doc(db, 'venues', venueId);
    await deleteDoc(venueRef);
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
};

/**
 * Increment venue view count
 * @param {string} venueId - Venue ID
 * @returns {Promise} Promise that resolves when count is incremented
 */
export const incrementViewCount = async (venueId) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    await updateDoc(venueRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw error for view count failures
  }
};

/**
 * Validate venue data before saving
 * @param {Object} venueData - Venue data to validate
 * @returns {Object} Validation result with isValid boolean and errors object
 */
export const validateVenueData = (venueData) => {
  const errors = {};

  // Venue name validation
  if (!venueData.name || venueData.name.trim().length < 3) {
    errors.name = 'Venue name must be at least 3 characters';
  } else if (venueData.name.length > 100) {
    errors.name = 'Venue name must be less than 100 characters';
  } else if (!/^[a-zA-Z0-9\s\-'&.,()]+$/.test(venueData.name)) {
    errors.name = 'Venue name contains invalid characters';
  }

  // Description validation
  if (!venueData.description || venueData.description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters';
  } else if (venueData.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  // Category validation
  if (!venueData.category) {
    errors.category = 'Category is required';
  } else if (!venueCategories().find(cat => cat.id === venueData.category)) {
    errors.category = 'Invalid category selected';
  }

  // Address validation
  if (!venueData.address) {
    errors.address = 'Address information is required';
  } else {
    if (!venueData.address.street || venueData.address.street.trim().length < 3) {
      errors.addressStreet = 'Street address is required (minimum 3 characters)';
    }
    
    if (!venueData.address.city || venueData.address.city.trim().length < 2) {
      errors.addressCity = 'City is required (minimum 2 characters)';
    }
    
    if (!venueData.address.country) {
      errors.addressCountry = 'Country is required';
    }
  }

  // Creator validation
  if (!venueData.createdBy) {
    errors.createdBy = 'Creator information is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format address object into a readable string
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postcode) parts.push(address.postcode);
  if (address.country) parts.push(address.country);

  return parts.join(', ');
};

/**
 * Delete a single photo from venue
 * @param {string} venueId - Venue ID
 * @param {string} photoURL - Photo URL to delete
 * @returns {Promise} Promise that resolves when photo is deleted
 */
export const deleteVenuePhoto = async (venueId, photoURL) => {
  try {
    // Delete from storage
    const pathMatch = photoURL.match(/venues%2F[^?]+/);
    if (pathMatch) {
      const decodedPath = decodeURIComponent(pathMatch[0]);
      const photoRef = ref(storage, decodedPath);
      await deleteObject(photoRef);
    }

    // Update venue document
    const venue = await getVenue(venueId);
    if (venue) {
      const updatedPhotos = venue.photos.filter(url => url !== photoURL);
      await updateDoc(doc(db, 'venues', venueId), {
        photos: updatedPhotos,
        primaryPhotoURL: updatedPhotos[0] || '',
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error deleting venue photo:', error);
    throw error;
  }
};

/**
 * Reorder venue photos
 * @param {string} venueId - Venue ID
 * @param {Array} photoOrder - New order of photo URLs
 * @returns {Promise} Promise that resolves when reorder is complete
 */
export const reorderVenuePhotos = async (venueId, photoOrder) => {
  try {
    await updateDoc(doc(db, 'venues', venueId), {
      photos: photoOrder,
      primaryPhotoURL: photoOrder[0] || '',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error reordering venue photos:', error);
    throw error;
  }
};

/**
 * Geocode a venue's address and update its coordinates
 * @param {string} venueId - Venue ID
 * @returns {Promise<Object>} Promise that resolves with geocoding result
 */
export const geocodeVenue = async (venueId) => {
  try {
    const venue = await getVenue(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    if (venue.coordinates && venue.coordinates.lat && venue.coordinates.lng) {
      console.log('Venue already has coordinates');
      return { success: true, coordinates: venue.coordinates, alreadyGeocoded: true };
    }

    const addressString = venue.address.fullAddress || formatAddress(venue.address);
    if (!addressString) {
      throw new Error('No address available for geocoding');
    }

    // Perform geocoding
    const geocodeResult = await geocodingService.geocodeAddress(addressString);
    
    // Update venue with coordinates
    const updateData = {
      coordinates: geocodeResult.coordinates,
      geocoding: {
        formatted_address: geocodeResult.formatted_address,
        placeId: geocodeResult.place_id,
        addressComponents: geocodeResult.address_components,
        geocodedAt: new Date().toISOString(),
        method: 'retroactive_geocoding'
      },
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'venues', venueId), updateData);

    return { 
      success: true, 
      coordinates: geocodeResult.coordinates,
      geocoding: updateData.geocoding 
    };
  } catch (error) {
    console.error('Error geocoding venue:', error);
    throw error;
  }
};

/**
 * Batch geocode multiple venues
 * @param {Array} venueIds - Array of venue IDs to geocode
 * @returns {Promise<Array>} Promise that resolves with array of results
 */
export const batchGeocodeVenues = async (venueIds) => {
  const results = [];
  
  for (const venueId of venueIds) {
    try {
      const result = await geocodeVenue(venueId);
      results.push({ venueId, success: true, ...result });
      
      // Add delay to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({ venueId, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Get venues that need geocoding (don't have coordinates)
 * @param {number} limit - Maximum number of venues to return
 * @returns {Promise<Array>} Promise that resolves with array of venues without coordinates
 */
export const getVenuesWithoutCoordinates = async (limit = 50) => {
  try {
    const venuesQuery = query(
      collection(db, 'venues'),
      where('coordinates', '==', null),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(venuesQuery);
    const venues = [];
    
    querySnapshot.forEach((doc) => {
      venues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return venues;
  } catch (error) {
    console.error('Error getting venues without coordinates:', error);
    throw error;
  }
};

/**
 * Get venues with coordinates (geocoded venues)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Promise that resolves with array of geocoded venues
 */
export const getGeocodedVenues = async (options = {}) => {
  try {
    const { limit: limitCount = 100 } = options;
    
    // For now, get all venues and filter client-side
    // In production, you'd want a proper compound query
    const venuesQuery = query(
      collection(db, 'venues'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(venuesQuery);
    const venues = [];
    
    querySnapshot.forEach((doc) => {
      const venueData = { id: doc.id, ...doc.data() };
      
      // Only include venues with coordinates
      if (venueData.coordinates && venueData.coordinates.lat && venueData.coordinates.lng) {
        venues.push(venueData);
      }
    });
    
    return venues;
  } catch (error) {
    console.error('Error getting geocoded venues:', error);
    throw error;
  }
};

/**
 * Calculate distance from user location to venues
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @param {Array} venues - Array of venues
 * @returns {Array} Venues with distance property added
 */
export const addDistanceToVenues = (userLocation, venues) => {
  if (!userLocation || !venues) {
    return venues;
  }

  return venues.map(venue => ({
    ...venue,
    distance: venue.coordinates 
      ? geocodingService.calculateDistance(userLocation, venue.coordinates)
      : null
  }));
};

/**
 * Sort venues by distance from user location
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @param {Array} venues - Array of venues
 * @returns {Array} Venues sorted by distance (closest first)
 */
export const sortVenuesByDistance = (userLocation, venues) => {
  if (!userLocation) {
    return venues;
  }

  const venuesWithDistance = addDistanceToVenues(userLocation, venues);
  
  return venuesWithDistance.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
};

/**
 * Get venues within a certain radius of a location
 * @param {Object} center - Center coordinates {lat, lng}
 * @param {number} radius - Radius in kilometers
 * @param {Array} venues - Array of venues to filter
 * @returns {Array} Venues within radius
 */
export const getVenuesWithinRadius = (center, radius, venues) => {
  if (!center || !radius || !venues) {
    return venues;
  }

  return venues.filter(venue => {
    if (!venue.coordinates) return false;
    
    const distance = geocodingService.calculateDistance(center, venue.coordinates);
    return distance !== null && distance <= radius;
  });
};

/**
 * Process multiple locations data by geocoding addresses
 * @param {Array} locations - Array of location objects
 * @returns {Promise<Array>} Processed locations with coordinates
 */
export const processMultipleLocations = async (locations) => {
  if (!Array.isArray(locations)) return [];
  
  const processedLocations = [];
  
  for (const location of locations) {
    try {
      let coordinates = null;
      let geocodingData = null;
      
      // Try to geocode each location
      const addressString = formatAddress(location.address);
      if (addressString) {
        try {
          const geocodeResult = await geocodingService.geocodeAddress(addressString);
          coordinates = geocodeResult.coordinates;
          geocodingData = {
            formatted_address: geocodeResult.formatted_address,
            placeId: geocodeResult.place_id,
            geocodedAt: new Date().toISOString(),
            method: 'location_geocoding'
          };
        } catch (error) {
          console.warn(`Geocoding failed for location ${location.name}:`, error);
        }
      }
      
      processedLocations.push({
        id: location.id,
        name: location.name || '',
        address: location.address,
        coordinates: coordinates,
        geocoding: geocodingData,
        isMain: location.isMain || false,
        phone: location.phone || '',
        hours: location.hours || null,
        notes: location.notes || ''
      });
    } catch (error) {
      console.error(`Error processing location ${location.name}:`, error);
      // Add location without coordinates if processing fails
      processedLocations.push({
        id: location.id,
        name: location.name || '',
        address: location.address,
        coordinates: null,
        geocoding: null,
        isMain: location.isMain || false,
        phone: location.phone || '',
        hours: location.hours || null,
        notes: location.notes || ''
      });
    }
  }
  
  return processedLocations;
};

/**
 * Get venues by selected tags
 * @param {Array} selectedTags - Array of tag IDs
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Venues that match the tags
 */
export const getVenuesByTags = async (selectedTags, options = {}) => {
  try {
    if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
      return await getVenues(options);
    }
    
    // For now, get all venues and filter client-side
    // In production, consider using array-contains-any or multiple queries
    const allVenues = await getVenues({ ...options, limitCount: 100 });
    
    const filteredVenues = allVenues.venues.filter(venue => {
      if (!venue.tags || !Array.isArray(venue.tags)) return false;
      
      // Check if venue has any of the selected tags
      return selectedTags.some(tagId => venue.tags.includes(tagId));
    });
    
    return {
      venues: filteredVenues,
      hasMore: false // Since we're filtering client-side
    };
  } catch (error) {
    console.error('Error getting venues by tags:', error);
    throw error;
  }
};

/**
 * Search venues with combined text and tag filtering
 * @param {string} query - Search query
 * @param {Array} tags - Array of tag IDs to filter by
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Matching venues
 */
export const searchVenuesWithTags = async (query, tags = [], options = {}) => {
  try {
    // Get all venues first (in production, this should use full-text search)
    const allVenues = await getVenues({ ...options, limitCount: 200 });
    
    let filteredVenues = allVenues.venues;
    
    // Apply text search filter
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredVenues = filteredVenues.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm) ||
        venue.description.toLowerCase().includes(searchTerm) ||
        venue.category.toLowerCase().includes(searchTerm) ||
        (venue.address && venue.address.city && venue.address.city.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply tags filter
    if (tags && tags.length > 0) {
      filteredVenues = filteredVenues.filter(venue => {
        if (!venue.tags || !Array.isArray(venue.tags)) return false;
        return tags.some(tagId => venue.tags.includes(tagId));
      });
    }
    
    return {
      venues: filteredVenues,
      hasMore: false
    };
  } catch (error) {
    console.error('Error searching venues with tags:', error);
    throw error;
  }
};

/**
 * Get all available tags with usage counts
 * @returns {Array} All venue tags
 */
export const getAllAvailableTags = () => {
  return venueTags;
};

/**
 * Get tags by category
 * @param {string} category - Tag category
 * @returns {Array} Tags in the category
 */
export const getTagsByCategory = (category) => {
  return venueTags.filter(tag => tag.category === category);
};

/**
 * Get most popular tags based on usage
 * @param {number} limit - Maximum number of tags to return
 * @returns {Promise<Array>} Popular tags
 */
export const getPopularTags = async (limit = 10) => {
  try {
    // In a production environment, you'd query the database for tag usage counts
    // For now, return the first 'limit' tags
    return venueTags.slice(0, limit);
  } catch (error) {
    console.error('Error getting popular tags:', error);
    return venueTags.slice(0, limit);
  }
};

/**
 * Update venue with enhanced data
 * @param {string} venueId - Venue ID
 * @param {Object} enhancedData - Enhanced venue data
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateVenueWithEnhancedData = async (venueId, enhancedData) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    
    const updateData = {
      ...enhancedData,
      updatedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };
    
    // Process social media links if provided
    if (enhancedData.socialMedia) {
      updateData.socialMedia = processAllSocialMediaLinks(enhancedData.socialMedia);
    }
    
    // Process tags if provided
    if (enhancedData.tags) {
      updateData.tagsList = enhancedData.tags.map(tagId => {
        const tag = venueTags.find(t => t.id === tagId);
        return tag ? { id: tag.id, name: tag.name, category: tag.category } : null;
      }).filter(Boolean);
    }
    
    await updateDoc(venueRef, updateData);
  } catch (error) {
    console.error('Error updating venue with enhanced data:', error);
    throw error;
  }
};

/**
 * Legacy createVenue function for backward compatibility
 */
export const createVenue = createEnhancedVenue;