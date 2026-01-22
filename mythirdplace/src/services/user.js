import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';
import { db, storage } from './firebase';
import { compressProfilePhoto } from '../utils/imageCompression';

/**
 * Create a new user profile in Firestore
 * @param {string} uid - User's unique ID from Firebase Auth
 * @param {Object} userData - User profile data
 * @returns {Promise} Promise that resolves when profile is created
 */
export const createUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    const profileData = {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      bio: userData.bio || '',
      profilePhotoURL: userData.profilePhotoURL || '',
      linkedinURL: userData.linkedinURL || '',
      portfolioURL: userData.portfolioURL || '',
      publicEmail: userData.publicEmail || '',
      showPublicEmail: userData.showPublicEmail || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isVerified: false,
      profileComplete: false,
      badges: [], // User badges array
      isMigratedUser: false // Flag for migrated users
    };
    
    await setDoc(userRef, profileData);
    return profileData;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} uid - User's unique ID
 * @returns {Promise} Promise that resolves with user profile data
 */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User's unique ID
 * @param {Object} updates - Profile updates
 * @returns {Promise} Promise that resolves when profile is updated
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Calculate profile completion
    const profile = await getUserProfile(uid);
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      updateData.profileComplete = checkProfileCompletion(updatedProfile);
    }
    
    await updateDoc(userRef, updateData);
    return updateData;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload profile photo to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User's unique ID
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} Promise that resolves with download URL
 */
export const uploadProfilePhoto = async (file, userId, onProgress = null) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image under 5MB.');
    }

    // Compress image before upload
    const compressedFile = await compressProfilePhoto(file);

    const storageRef = ref(storage, `profile-photos/${userId}.jpg`);

    if (onProgress) {
      // Use uploadBytesResumable for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
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
    } else {
      // Simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, compressedFile);
      return await getDownloadURL(snapshot.ref);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Delete profile photo from Firebase Storage
 * @param {string} userId - User's unique ID
 * @returns {Promise} Promise that resolves when photo is deleted
 */
export const deleteProfilePhoto = async (userId) => {
  try {
    const storageRef = ref(storage, `profile-photos/${userId}`);
    await deleteObject(storageRef);
  } catch (error) {
    // If file doesn't exist, that's okay
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
};

/**
 * Update profile photo URL in user document
 * @param {string} userId - User's unique ID
 * @param {string} photoURL - New photo URL (or empty string to remove)
 * @returns {Promise} Promise that resolves when profile is updated
 */
export const updateProfilePhoto = async (userId, photoURL) => {
  try {
    return await updateUserProfile(userId, { profilePhotoURL: photoURL });
  } catch (error) {
    throw error;
  }
};

/**
 * Validate profile data before saving
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result with isValid boolean and errors object
 */
export const validateProfileData = (profileData) => {
  const errors = {};
  
  // Display name validation
  if (!profileData.displayName || profileData.displayName.trim().length < 2) {
    errors.displayName = 'Display name must be at least 2 characters';
  } else if (profileData.displayName.length > 50) {
    errors.displayName = 'Display name must be less than 50 characters';
  } else if (!/^[a-zA-Z0-9\s]+$/.test(profileData.displayName)) {
    errors.displayName = 'Display name can only contain letters, numbers, and spaces';
  }
  
  // Bio validation
  if (profileData.bio && profileData.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }
  
  // LinkedIn URL validation
  if (profileData.linkedinURL && profileData.linkedinURL.trim()) {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/;
    if (!linkedinRegex.test(profileData.linkedinURL)) {
      errors.linkedinURL = 'Please enter a valid LinkedIn profile URL';
    }
  }
  
  // Portfolio URL validation
  if (profileData.portfolioURL && profileData.portfolioURL.trim()) {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(profileData.portfolioURL)) {
      errors.portfolioURL = 'Please enter a valid URL';
    }
  }
  
  // Public email validation
  if (profileData.publicEmail && profileData.publicEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.publicEmail)) {
      errors.publicEmail = 'Please enter a valid email address';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check profile completion percentage and status
 * @param {Object} profileData - User profile data
 * @returns {boolean} True if profile is considered complete
 */
export const checkProfileCompletion = (profileData) => {
  if (!profileData) return false;
  
  // Required fields for completion
  const requiredFields = [
    'displayName',
    'bio',
    'profilePhotoURL'
  ];
  
  // Check if all required fields are filled
  const hasRequiredFields = requiredFields.every(field => 
    profileData[field] && profileData[field].toString().trim().length > 0
  );
  
  return hasRequiredFields;
};

/**
 * Search users by display name
 * @param {string} searchTerm - Search term for user names
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Promise that resolves with array of user profiles
 */
export const searchUsersByName = async (searchTerm, maxResults = 10) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push(getPublicProfile(doc.data()));
    });
    
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Get sanitized public profile data
 * @param {Object} profileData - Complete user profile
 * @returns {Object} Public profile data with private fields removed
 */
export const getPublicProfile = (profileData) => {
  if (!profileData) return null;
  
  const publicProfile = {
    uid: profileData.uid,
    displayName: profileData.displayName,
    bio: profileData.bio,
    profilePhotoURL: profileData.profilePhotoURL,
    linkedinURL: profileData.linkedinURL,
    portfolioURL: profileData.portfolioURL,
    createdAt: profileData.createdAt,
    isVerified: profileData.isVerified,
    profileComplete: profileData.profileComplete,
    badges: profileData.badges || [], // Include badges in public profile
    isMigratedUser: profileData.isMigratedUser || false
  };
  
  // Only include public email if user has enabled it
  if (profileData.showPublicEmail && profileData.publicEmail) {
    publicProfile.publicEmail = profileData.publicEmail;
  }
  
  return publicProfile;
};

/**
 * Get complete private profile data (for profile owner only)
 * @param {string} userId - User's unique ID
 * @returns {Promise<Object>} Promise that resolves with complete profile data
 */
export const getPrivateProfile = async (userId) => {
  try {
    return await getUserProfile(userId);
  } catch (error) {
    throw error;
  }
};

/**
 * Update email visibility setting
 * @param {string} userId - User's unique ID
 * @param {boolean} isVisible - Whether to show public email
 * @returns {Promise} Promise that resolves when setting is updated
 */
export const updateEmailVisibility = async (userId, isVisible) => {
  try {
    return await updateUserProfile(userId, { showPublicEmail: isVisible });
  } catch (error) {
    throw error;
  }
};

/**
 * Add badge to user profile
 * @param {string} userId - User's unique ID
 * @param {string} badge - Badge name to add
 * @returns {Promise} Promise that resolves when badge is added
 */
export const addUserBadge = async (userId, badge) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('User profile not found');

    const badges = profile.badges || [];
    if (!badges.includes(badge)) {
      badges.push(badge);
      await updateUserProfile(userId, { badges });
    }

    return badges;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove badge from user profile
 * @param {string} userId - User's unique ID
 * @param {string} badge - Badge name to remove
 * @returns {Promise} Promise that resolves when badge is removed
 */
export const removeUserBadge = async (userId, badge) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('User profile not found');

    const badges = profile.badges || [];
    const updatedBadges = badges.filter(b => b !== badge);

    if (badges.length !== updatedBadges.length) {
      await updateUserProfile(userId, { badges: updatedBadges });
    }

    return updatedBadges;
  } catch (error) {
    throw error;
  }
};

/**
 * Get available badge definitions
 * @returns {Object} Badge definitions with names, descriptions, and styles
 */
export const getBadgeDefinitions = () => {
  return {
    'Newcomer': {
      name: 'Newcomer',
      description: 'New to the community',
      color: '#007bff',
      icon: '👋'
    },
    'Supporter': {
      name: 'Supporter',
      description: 'Early platform supporter',
      color: '#ffd700',
      icon: '🌟'
    },
    'Regular': {
      name: 'Regular',
      description: 'Active community member',
      color: '#28a745',
      icon: '⭐'
    },
    'Blogger': {
      name: 'Blogger',
      description: 'Published community blogs',
      color: '#6f42c1',
      icon: '✍️'
    },
    'Venue Creator': {
      name: 'Venue Creator',
      description: 'Added venues to the platform',
      color: '#fd7e14',
      icon: '🏢'
    },
    'Verified': {
      name: 'Verified',
      description: 'Verified account',
      color: '#007bff',
      icon: '✅'
    }
  };
};