import React from 'react';
import { motion } from 'framer-motion';

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="text-lg font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingFallback;