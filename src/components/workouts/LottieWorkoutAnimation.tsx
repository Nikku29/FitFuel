
import React from 'react';
import Lottie from 'lottie-react';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';
import { Skeleton } from '@/components/ui/skeleton';

interface LottieWorkoutAnimationProps {
  animationUrl: string | null;
  className?: string;
}

const LottieWorkoutAnimation: React.FC<LottieWorkoutAnimationProps> = ({ 
  animationUrl, 
  className = "w-[150px] h-[150px] md:w-[200px] md:h-[200px]" 
}) => {
  const { containerRef, animationData, shouldPlay, isLoading, hasError } = useLottieAnimation(animationUrl);

  if (!animationUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center`}>
        <div className="text-purple-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${className} flex items-center justify-center overflow-hidden rounded-lg`}>
      {isLoading && (
        <Skeleton className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100" />
      )}
      
      {hasError && (
        <div className="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
          <div className="text-red-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
        </div>
      )}
      
      {shouldPlay && animationData && (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
          className="object-contain"
        />
      )}
    </div>
  );
};

export default LottieWorkoutAnimation;
