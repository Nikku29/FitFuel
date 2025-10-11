
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseInstructionsProps {
  showInstructions: boolean;
  toggleInstructions: () => void;
  instructions: string[];
  exerciseName: string;
}

const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({ 
  showInstructions, 
  toggleInstructions, 
  instructions,
  exerciseName
}) => {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <Button 
          onClick={toggleInstructions} 
          variant="ghost" 
          size="sm"
          className="text-xs hover:bg-purple-100 text-purple-700 transition-colors"
        >
          {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
        </Button>
      </div>
      
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Alert className="mb-4 bg-white border-purple-200">
                <AlertDescription>
                  <h5 className="font-semibold mb-2 text-purple-800">How to perform this exercise:</h5>
                  <ol className="list-decimal pl-5 space-y-1">
                    {instructions.map((instruction, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                        className="text-gray-700"
                      >
                        {instruction}
                      </motion.li>
                    ))}
                  </ol>
                </AlertDescription>
              </Alert>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExerciseInstructions;
