
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
  apiKey: getEnv("VITE_FIREBASE_API_KEY", ""),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", ""),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", ""),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", ""),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", ""),
  appId: getEnv("VITE_FIREBASE_APP_ID", ""),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", ""),
  databaseURL: getEnv("VITE_FIREBASE_DATABASE_URL", "")
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
