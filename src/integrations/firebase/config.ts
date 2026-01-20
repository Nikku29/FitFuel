
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDm3OSmoo3Gs_kh9jD_uVjZxt9XuZu6qcM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fitfusion-f04d5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitfusion-f04d5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fitfusion-f04d5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "251737656018",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:251737656018:web:19d0d8c218a9faf6b8bb0b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y2RCMQMWFQ",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
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
