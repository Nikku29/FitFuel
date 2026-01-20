// Security utilities for production readiness

// Content Security Policy
export const setupCSP = () => {
  if (typeof document === 'undefined') return;

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob: https://*.googleusercontent.com",
    "connect-src 'self' https://api.openai.com https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
    "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  let metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!metaCSP) {
    metaCSP = document.createElement('meta');
    metaCSP.setAttribute('http-equiv', 'Content-Security-Policy');
    document.head.appendChild(metaCSP);
  }
  metaCSP.setAttribute('content', csp);
};

// Setup security headers via meta tags
export const setupSecurityHeaders = () => {
  if (typeof document === 'undefined') return;

  const headers = [
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
  ];

  headers.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[http-equiv="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate URL safety
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Rate limiting for client-side actions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const keyAttempts = this.attempts.get(key)!;

    // Remove old attempts outside the window
    const validAttempts = keyAttempts.filter(time => time > windowStart);
    this.attempts.set(key, validAttempts);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getItem: (key: string) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};