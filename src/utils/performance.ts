
// Performance monitoring utilities
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userId?: string;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVital[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initPerformanceObserver();
    this.initWebVitalsTracking();
  }

  private initPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          this.trackMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            url: window.location.pathname,
          });
        });
      });

      // Observe navigation and resource timing
      this.observer.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    }
  }

  private initWebVitalsTracking() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCLS();
    this.trackFID();
    this.trackLCP();
    this.trackFCP();
    this.trackTTFB();
  }

  private trackCLS() {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsEntries.push(entry as any);
          clsValue += (entry as any).value;
        }
      }

      this.trackWebVital({
        name: 'CLS',
        value: clsValue,
        delta: clsValue,
        id: 'cls-' + Date.now(),
        timestamp: Date.now()
      });
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }

  private trackFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const processingStart = (entry as any).processingStart || entry.startTime;
        this.trackWebVital({
          name: 'FID',
          value: processingStart - entry.startTime,
          delta: processingStart - entry.startTime,
          id: 'fid-' + Date.now(),
          timestamp: Date.now()
        });
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  private trackLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.trackWebVital({
        name: 'LCP',
        value: lastEntry.startTime,
        delta: lastEntry.startTime,
        id: 'lcp-' + Date.now(),
        timestamp: Date.now()
      });
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private trackFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackWebVital({
            name: 'FCP',
            value: entry.startTime,
            delta: entry.startTime,
            id: 'fcp-' + Date.now(),
            timestamp: Date.now()
          });
        }
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  }

  private trackTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      
      this.trackWebVital({
        name: 'TTFB',
        value: ttfb,
        delta: ttfb,
        id: 'ttfb-' + Date.now(),
        timestamp: Date.now()
      });
    }
  }

  trackMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.sendMetricsToAnalytics([metric]);
  }

  trackWebVital(vital: WebVital) {
    this.webVitals.push(vital);
    this.sendWebVitalToAnalytics(vital);
  }

  trackCustomTiming(name: string, startTime: number, endTime?: number) {
    const value = endTime ? endTime - startTime : performance.now() - startTime;
    
    this.trackMetric({
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getWebVitals(): WebVital[] {
    return [...this.webVitals];
  }

  private sendMetricsToAnalytics(metrics: PerformanceMetric[]) {
    // Send to analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      metrics.forEach(metric => {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: Math.round(metric.value),
          page_path: metric.url,
        });
      });
    }

    // Log for debugging
    console.log('Performance metrics:', metrics);
  }

  private sendWebVitalToAnalytics(vital: WebVital) {
    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', vital.name, {
        value: Math.round(vital.value),
        metric_id: vital.id,
        metric_value: Math.round(vital.value),
        metric_delta: Math.round(vital.delta),
      });
    }

    // Log for debugging
    console.log('Web Vital:', vital);
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility functions for manual performance tracking
export const startTimer = (name: string): (() => void) => {
  const startTime = performance.now();
  
  return () => {
    performanceMonitor.trackCustomTiming(name, startTime);
  };
};

export const measureAsync = async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
  const endTimer = startTimer(name);
  try {
    const result = await asyncFn();
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    throw error;
  }
};

// Resource loading metrics
export const trackResourceLoad = (resourceUrl: string, loadTime: number) => {
  performanceMonitor.trackMetric({
    name: `resource_load_${resourceUrl.split('/').pop()}`,
    value: loadTime,
    timestamp: Date.now(),
    url: window.location.pathname,
  });
};
