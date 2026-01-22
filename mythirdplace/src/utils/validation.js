/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if passwords match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateDisplayName = (displayName) => {
  if (!displayName || displayName.trim().length < 2) {
    return {
      isValid: false,
      message: 'Display name must be at least 2 characters long'
    };
  }
  
  if (displayName.trim().length > 50) {
    return {
      isValid: false,
      message: 'Display name must be less than 50 characters'
    };
  }
  
  return {
    isValid: true,
    message: 'Display name is valid'
  };
};

/**
 * Get Firebase auth error message
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An error occurred. Please try again.';
  }
};