
import { useEffect, useRef } from 'react';
import { performanceMonitor, startTimer } from '@/utils/performance';

// Hook for tracking component render performance
export const useRenderTracking = (componentName: string) => {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceMonitor.trackCustomTiming(`render_${componentName}`, renderStart.current, performance.now());
  });
};

// Hook for tracking API call performance
export const useApiTracking = () => {
  const trackApiCall = async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const endTimer = startTimer(`api_${apiName}`);
    
    try {
      const result = await apiCall();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  };

  return { trackApiCall };
};

// Hook for tracking user interactions
export const useInteractionTracking = (componentName: string) => {
  const trackInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackCustomTiming(
      `interaction_${componentName}_${interactionType}`,
      performance.now()
    );
    
    // Also track with user behavior tracker
    if (typeof window !== 'undefined') {
      console.log(`Interaction tracked: ${componentName} - ${interactionType}`, metadata);
    }
  };

  return { trackInteraction };
};

// Hook for tracking page load performance
export const usePageLoadTracking = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackCustomTiming(`page_load_${pageName}`, startTime, performance.now());
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pageName]);
};
