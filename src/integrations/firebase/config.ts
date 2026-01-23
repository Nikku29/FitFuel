
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Helper to safely get env vars in both Vite (client) and Node (script) environments
const getEnv = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

// Firebase configuration using environment variables
export const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyB5xGQjDtANHWOrILBHL8lVE00wVwEqcJU"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "fitfuel-9a387.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "fitfuel-9a387"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "fitfuel-9a387.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "355503155035"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:355503155035:web:3e11256ba6d9fd09465c7e"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-5011FW4RL7"),
  databaseURL: getEnv("VITE_FIREBASE_DATABASE_URL", "https://fitfuel-9a387-default-rtdb.asia-southeast1.firebasedatabase.app")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
let analytics: any = null;
let performance: any = null;

try {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
  }
} catch (error) {
  console.warn('Analytics/Performance not available:', error);
}

export { analytics, performance };


export default app;
