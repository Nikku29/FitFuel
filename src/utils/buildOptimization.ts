// Build optimization utilities for production readiness

// Lazy loading utilities
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error('Failed to load component:', error);
      if (fallback) {
        return { default: fallback };
      }
      throw error;
    }
  });
};

// Image optimization
export const optimizeImage = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}): string => {
  if (!options) return src;
  
  const url = new URL(src, window.location.origin);
  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  return `${url.pathname}?${params.toString()}`;
};

// Resource preloading
export const preloadResources = () => {
  if (typeof document === 'undefined') return;

  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    { href: '/api/workouts', as: 'fetch' },
    { href: '/api/recipes', as: 'fetch' }
  ];

  criticalResources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Bundle analysis
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.includes('.js')) {
        console.log(`Bundle ${entry.name}: ${(entry as any).transferSize} bytes`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
};

// Tree shaking detection
export const detectUnusedExports = () => {
  if (import.meta.env.DEV) {
    console.log('Tree shaking analysis available in production build');
  }
};

// Code splitting strategy
export const shouldSplitComponent = (componentName: string): boolean => {
  const heavyComponents = [
    'MonitoringDashboard',
    'PerformanceDashboard',
    'WorkoutDetailModal',
    'AIChat'
  ];
  
  return heavyComponents.includes(componentName);
};

// Critical CSS extraction
export const extractCriticalCSS = () => {
  if (typeof document === 'undefined') return '';

  const criticalSelectors = [
    'body', 'html',
    '.min-h-screen',
    '.bg-gradient-to-b',
    '.container',
    '.flex',
    '.grid'
  ];

  const criticalStyles: string[] = [];
  
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          if (criticalSelectors.some(selector => 
            rule.selectorText.includes(selector)
          )) {
            criticalStyles.push(rule.cssText);
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets
    }
  });

  return criticalStyles.join('\n');
};

import React from 'react';