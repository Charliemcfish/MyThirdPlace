import { Platform } from 'react-native';

let isLoading = false;
let isLoaded = false;
let loadPromise = null;

/**
 * Load Google Maps JavaScript API
 * @returns {Promise<boolean>} Promise that resolves when API is loaded
 */
export const loadGoogleMapsAPI = async () => {
  // Only load on web platform
  if (Platform.OS !== 'web') {
    return false;
  }

  // If already loaded, return immediately
  if (isLoaded) {
    return true;
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // If Google Maps is already available (loaded by another script)
  if (window.google && window.google.maps) {
    isLoaded = true;
    return true;
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    try {
      const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
      
      if (!API_KEY) {
        console.error('Google Maps API key not found in environment variables');
        resolve(false);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;

      // Handle successful load
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        isLoaded = true;
        isLoading = false;
        resolve(true);
      };

      // Handle load error
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        isLoading = false;
        resolve(false);
      };

      // Add script to document
      document.head.appendChild(script);

    } catch (error) {
      console.error('Error setting up Google Maps API script:', error);
      isLoading = false;
      resolve(false);
    }
  });

  return loadPromise;
};

/**
 * Check if Google Maps API is available
 * @returns {boolean} Whether the API is loaded and ready
 */
export const isGoogleMapsAPILoaded = () => {
  if (Platform.OS !== 'web') {
    return false;
  }
  
  return !!(window.google && window.google.maps && window.google.maps.places);
};

/**
 * Wait for Google Maps API to be available with timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise<boolean>} Whether the API became available
 */
export const waitForGoogleMapsAPI = async (timeoutMs = 10000) => {
  if (Platform.OS !== 'web') {
    return false;
  }

  if (isGoogleMapsAPILoaded()) {
    return true;
  }

  // Try to load the API first
  await loadGoogleMapsAPI();

  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (isGoogleMapsAPILoaded()) {
      return true;
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.warn(`Google Maps API not available after ${timeoutMs}ms timeout`);
  return false;
};