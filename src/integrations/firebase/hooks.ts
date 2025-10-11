import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import * as authService from './auth';
import * as firestoreService from './firestore';
import * as storageService from './storage';

// Auth hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signInWithGoogle: authService.signInWithGoogle,
    logOut: authService.logOut,
    resetPassword: authService.resetPassword,
    sendVerificationEmail: authService.sendVerificationEmail,
    setSessionPersistence: authService.setSessionPersistence,
  };
};

// Firestore hooks
export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const result = await firestoreService.getProfile(userId);
      if (result) {
        setProfile(result);
        setError(null);
      } else {
        setError('Failed to fetch profile' as any);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    updateProfile: firestoreService.updateProfile,
    createProfile: firestoreService.createProfile,
  };
};

export const useWorkoutLogs = (userId: string | null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      const result = await firestoreService.getUserWorkoutLogs(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setLogs(result.logs as any);
        setError(null);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [userId]);

  return {
    logs,
    loading,
    error,
    logWorkout: firestoreService.logWorkout,
    refetch: () => {
      if (userId) {
        firestoreService.getUserWorkoutLogs(userId).then((result) => {
          if (!result.error) {
            setLogs(result.logs as any);
          }
        });
      }
    },
  };
};

export const useUserFavorites = (userId: string | null, itemType?: string) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      const result = await firestoreService.getUserFavorites(userId, itemType);
      if (result.error) {
        setError(result.error);
      } else {
        setFavorites(result.favorites as any);
        setError(null);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [userId, itemType]);

  return {
    favorites,
    loading,
    error,
    addToFavorites: firestoreService.addToFavorites,
    removeFromFavorites: firestoreService.removeFromFavorites,
    refetch: () => {
      if (userId) {
        firestoreService.getUserFavorites(userId, itemType).then((result) => {
          if (!result.error) {
            setFavorites(result.favorites as any);
          }
        });
      }
    },
  };
};

// Storage hooks
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file: File, path: string) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await storageService.uploadFile(file, path, (progress) => {
        setProgress(progress);
      });

      if (result.error) {
        setError(result.error);
        return null;
      }

      return result.url;
    } catch (err) {
      setError(err as any);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error,
    uploadUserAvatar: storageService.uploadUserAvatar,
    uploadWorkoutMedia: storageService.uploadWorkoutMedia,
    uploadRecipeImage: storageService.uploadRecipeImage,
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Track page load time
    const measurePageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          console.log('Page load time:', loadTime, 'ms');
          
          // You can send this to Firebase Performance or Analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'page_load_time', {
              event_category: 'Performance',
              value: Math.round(loadTime),
            });
          }
        }
      }
    };

    // Measure on component mount
    measurePageLoad();

    // Track memory usage periodically
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
};

// Custom error boundary hook
export const useErrorTracking = () => {
  const trackError = (error: Error, errorInfo?: any) => {
    console.error('Error tracked:', error, errorInfo);
    
    // Send to Firebase Analytics or Crashlytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
    
    // You could also send to Sentry or other error tracking services
  };

  return { trackError };
};