import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise} Firebase user credential
 */
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Firebase user credential
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise} Promise that resolves when sign out is complete
 */
export const logoutUser = async () => {
  try {
    console.log('Starting logout process...');
    await signOut(auth);
    console.log('Firebase signOut completed');
  } catch (error) {
    console.error('Error in logoutUser:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise} Promise that resolves when email is sent
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user
 * @returns {Object|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};