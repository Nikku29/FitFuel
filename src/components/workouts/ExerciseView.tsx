
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ExerciseInstructions from './ExerciseInstructions';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionButton } from '@/components/ui/motion-button';

interface ExerciseViewProps {
  exercise: {
    name: string;
    duration: string;
    description: string;
  };
  activeExerciseIndex: number;
  totalExercises: number;
  showInstructions: boolean;
  toggleInstructions: () => void;
  instructions: string[];
  onPrev: () => void;
  onNext: () => void;
  startBreakTimer: () => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  activeExerciseIndex,
  totalExercises,
  showInstructions,
  toggleInstructions,
  instructions,
  onPrev,
  onNext,
  startBreakTimer
}) => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      onNext();
      startBreakTimer();
      setCompleted(false);
    }, 800);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        key={activeExerciseIndex}
      >
        <div className="flex justify-between items-start mb-2">
          <motion.h4 
            className="font-medium text-xl text-purple-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {activeExerciseIndex + 1}. {exercise.name}
          </motion.h4>
        </div>
        
        <ExerciseInstructions 
          showInstructions={showInstructions}
          toggleInstructions={toggleInstructions}
          instructions={instructions}
          exerciseName={exercise.name}
        />
        
        <motion.p 
          className="text-gray-600 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Duration: {exercise.duration}
        </motion.p>
        <motion.p 
          className="text-gray-700 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {exercise.description}
        </motion.p>
        <div className="flex justify-between">
          <MotionButton 
            variant="outline" 
            disabled={activeExerciseIndex === 0}
            onClick={onPrev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-purple-300 text-purple-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </MotionButton>
          
          {activeExerciseIndex === totalExercises - 1 ? (
            <MotionButton
              onClick={handleComplete}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={completed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Finish Workout
            </MotionButton>
          ) : (
            <MotionButton
              onClick={handleComplete}
              disabled={completed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Complete <ArrowRight className="ml-1 h-4 w-4" />
            </MotionButton>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseView;
