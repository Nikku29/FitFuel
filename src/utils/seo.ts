// SEO utilities for production readiness
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
}

export const updatePageSEO = (config: SEOConfig) => {
  if (typeof document === 'undefined') return;

  // Update title
  document.title = config.title;

  // Update or create meta tags
  updateMetaTag('description', config.description);
  
  if (config.keywords) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // Open Graph tags
  updateMetaTag('og:title', config.title, 'property');
  updateMetaTag('og:description', config.description, 'property');
  updateMetaTag('og:type', config.type || 'website', 'property');
  
  if (config.image) {
    updateMetaTag('og:image', config.image, 'property');
  }
  
  if (config.url) {
    updateMetaTag('og:url', config.url, 'property');
  }
  
  if (config.siteName) {
    updateMetaTag('og:site_name', config.siteName, 'property');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', config.title, 'name');
  updateMetaTag('twitter:description', config.description, 'name');
  
  if (config.image) {
    updateMetaTag('twitter:image', config.image, 'name');
  }
};

const updateMetaTag = (
  name: string, 
  content: string, 
  attribute: 'name' | 'property' = 'name'
) => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

// Generate structured data for better SEO
export const generateStructuredData = (data: any) => {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
};

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (type) {
    link.type = type;
  }
  
  document.head.appendChild(link);
};

// Generate sitemap data
export const generateSitemapData = () => {
  const routes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/workouts', priority: 0.9, changefreq: 'weekly' },
    { path: '/recipes', priority: 0.8, changefreq: 'weekly' },
    { path: '/assistant', priority: 0.7, changefreq: 'monthly' },
    { path: '/community', priority: 0.6, changefreq: 'monthly' },
    { path: '/dashboard', priority: 0.5, changefreq: 'monthly' },
    { path: '/profile', priority: 0.4, changefreq: 'monthly' },
  ];

  return routes;
};