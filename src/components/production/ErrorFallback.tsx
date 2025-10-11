import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError,
  message = 'Something went wrong' 
}) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <motion.div 
        className="text-center space-y-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Oops! {message}
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
        </div>

        {error && import.meta.env.DEV && (
          <details className="text-left bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-sm">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-destructive overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={handleRefresh}
            className="gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ErrorFallback;