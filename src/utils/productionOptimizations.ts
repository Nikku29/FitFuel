// Comprehensive production optimizations
import { setupLazyLoading } from './imageOptimization';
import { setupCSP, setupSecurityHeaders } from './security';
import { preloadResources } from './buildOptimization';
import { performanceMonitor } from './performance';

// Global error handler
export const setupGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Log to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(event.reason);
    }
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Log to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(event.error);
    }
  });
};

// Performance optimizations
export const setupPerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Prefetch critical resources
  const criticalResources = [
    '/fonts/inter.woff2',
    '/favicon.ico'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });

  // Enable passive event listeners for better performance
  const passiveEvents = ['touchstart', 'touchmove', 'wheel'];
  passiveEvents.forEach(eventType => {
    document.addEventListener(eventType, () => {}, { passive: true });
  });
};

// Memory management
export const setupMemoryManagement = () => {
  if (typeof window === 'undefined') return;

  // Clean up performance entries periodically
  setInterval(() => {
    if (performance.getEntriesByType) {
      const entries = performance.getEntriesByType('measure');
      if (entries.length > 100) {
        performance.clearMeasures();
      }
    }
  }, 30000); // Every 30 seconds

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        console.warn('High memory usage detected');
        // Trigger garbage collection if possible
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }, 60000); // Every minute
  }
};

// Network optimization
export const setupNetworkOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Service worker registration for caching
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully');
      })
      .catch(error => {
        console.log('Service Worker registration failed');
      });
  }

  // Preload critical API endpoints
  const criticalEndpoints = ['/api/workouts', '/api/recipes'];
  criticalEndpoints.forEach(endpoint => {
    fetch(endpoint, { method: 'HEAD' }).catch(() => {
      // Silently fail for preloading
    });
  });
};

// Initialize all production optimizations
export const initializeProductionOptimizations = () => {
  if (import.meta.env.PROD) {
    setupGlobalErrorHandler();
    setupPerformanceOptimizations();
    setupMemoryManagement();
    setupNetworkOptimizations();
    setupLazyLoading();
    setupCSP();
    setupSecurityHeaders();
    preloadResources();
    
    console.log('Production optimizations initialized');
  }
};

// Cleanup function for development hot reload
export const cleanupProductionOptimizations = () => {
  // Cleanup performance monitoring
  performanceMonitor.cleanup();
  
  // Clear intervals and listeners if needed
  // This would be called during development hot reload
};