
import { useEffect, useRef, useState } from 'react';

export const useLottieAnimation = (animationUrl: string | null) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Intersection Observer to detect when animation is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Load animation data when visible and URL is provided
  useEffect(() => {
    if (!isVisible || !animationUrl || animationData) return;

    const loadAnimation = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const response = await fetch(animationUrl);
        if (!response.ok) {
          throw new Error('Failed to load animation');
        }
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [isVisible, animationUrl, animationData]);

  return {
    containerRef,
    animationData,
    isVisible,
    isLoading,
    hasError,
    shouldPlay: isVisible && !isLoading && !hasError && animationData
  };
};
