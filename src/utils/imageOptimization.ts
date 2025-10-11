
// Function to generate optimized image URLs for different sizes
export const getOptimizedImageUrl = (url: string, width: number): string => {
  // If it's already a URL with width parameters, don't modify
  if (url.includes('?width=')) {
    return url;
  }
  
  // If it's an unsplash URL, use their image optimization API
  if (url.includes('unsplash.com')) {
    // Extract the image ID and add width parameter
    const baseUrl = url.split('?')[0]; // Remove any existing query parameters
    return `${baseUrl}?w=${width}&q=80&auto=format`;
  }
  
  // If it's a Supabase Storage URL, we can add transformation parameters
  if (url.includes('storage.googleapis.com') || url.includes('supabaseusercontent.com')) {
    return `${url}?width=${width}&quality=75`;
  }
  
  // If it's a local asset with no URL, assume it's in the public directory
  if (url && url.startsWith('/')) {
    return url;
  }
  
  // For other URLs, return as is
  return url;
};

// Function to generate responsive srcSet
export const generateSrcSet = (url: string): string => {
  const widths = [320, 480, 640, 768, 1024, 1280];
  
  return widths
    .map(width => `${getOptimizedImageUrl(url, width)} ${width}w`)
    .join(', ');
};

// Function to lazy load images with IntersectionObserver
export const setupLazyLoading = (): void => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement;
          
          // Set the src to the value of data-src
          if (lazyImage.dataset.src) {
            lazyImage.src = lazyImage.dataset.src;
          }
          
          // Set the srcset to the value of data-srcset
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    
    // Observe all images with class "lazy"
    document.querySelectorAll('img.lazy').forEach(img => {
      lazyImageObserver.observe(img);
    });
  }
};

type ImageLoading = "lazy" | "eager";

// Component for optimized image rendering
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  className?: string;
  loading?: ImageLoading;
}

export const getOptimizedImageProps = ({ 
  src, 
  alt, 
  width,
  className = "",
  loading = "lazy"
}: OptimizedImageProps) => {
  return {
    src: getOptimizedImageUrl(src, width),
    alt,
    width,
    loading,
    className: `lazy ${className}`,
    "data-src": getOptimizedImageUrl(src, width),
    "data-srcset": generateSrcSet(src),
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.classList.add('loaded');
    }
  };
};
