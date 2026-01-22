import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

let cachedSettings = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getContentSettings = async () => {
  // Return cached settings if available and fresh
  if (cachedSettings && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedSettings;
  }

  try {
    const settingsRef = collection(db, 'systemSettings');
    const snapshot = await getDocs(settingsRef);
    const settings = {};

    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data().value;
    });

    // Cache the settings
    cachedSettings = settings;
    lastFetchTime = Date.now();

    return settings;
  } catch (error) {
    console.error('Error fetching content settings:', error);
    // Return cached settings if available, even if stale
    if (cachedSettings) {
      return cachedSettings;
    }
    // Return default settings
    return {};
  }
};

export const clearSettingsCache = () => {
  cachedSettings = null;
  lastFetchTime = null;
};
