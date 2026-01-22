import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDfcEu1yH_Q6-MFileyWucKN4i1mwQttnM",
  authDomain: "mythirdplace-b5bc3.firebaseapp.com",
  projectId: "mythirdplace-b5bc3",
  storageBucket: "mythirdplace-b5bc3.firebasestorage.app",
  messagingSenderId: "981438537885",
  appId: "1:981438537885:web:d2688b5a31a2eee9cfb474",
  measurementId: "G-PL9F0Z92QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;