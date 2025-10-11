
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { Progress } from '@/components/ui/progress';
import WorkoutTimer from './WorkoutTimer';
import WorkoutInfoHeader from './WorkoutInfoHeader';
import ExerciseView from './ExerciseView';
import { motion, AnimatePresence } from 'framer-motion';
import QuoteDisplay from './QuoteDisplay';
import WorkoutBenefits from './WorkoutBenefits';
import WorkoutEquipment from './WorkoutEquipment';
import WorkoutProgress from './WorkoutProgress';

interface WorkoutDetailModalProps {
  selectedWorkout: any;
  onClose: () => void;
  exerciseInstructions: Record<string, string[]>;
  time: number;
  isRunning: boolean;
  isBreakTime: boolean;
  breakTime: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  startBreakTimer: () => void;
}

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  selectedWorkout,
  onClose,
  exerciseInstructions,
  time,
  isRunning,
  isBreakTime,
  breakTime,
  startTimer,
  pauseTimer,
  stopTimer,
  startBreakTimer
}) => {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const calculateTotalDuration = (exercises: any[]) => {
    return exercises.reduce((total, exercise) => {
      const minutes = parseInt(exercise.duration.split(' ')[0]);
      return total + minutes;
    }, 0);
  };

  // Get instructions for current exercise or general instructions if not found
  const getCurrentExerciseInstructions = () => {
    if (!selectedWorkout) return [];
    
    const currentExercise = selectedWorkout.exercises[activeExerciseIndex].name;
    return exerciseInstructions[currentExercise] || [
      "Start in the proper position as described for this exercise.",
      "Focus on form rather than speed.",
      "Breathe steadily throughout the movement.",
      "If you feel pain (not just muscle fatigue), stop immediately."
    ];
  };

  if (!selectedWorkout) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <WorkoutInfoHeader 
            workout={selectedWorkout}
          />
          
          <div className="p-6">
            <QuoteDisplay workoutType={selectedWorkout.type} className="mb-4" />
            
            {/* Timer Section */}
            <WorkoutTimer
              isBreakTime={isBreakTime}
              breakTime={breakTime}
              time={time}
              isRunning={isRunning}
              onStart={startTimer}
              onPause={pauseTimer}
              onStop={stopTimer}
              onBreak={startBreakTimer}
            />
            
            {/* Equipment Section */}
            <WorkoutEquipment equipment={selectedWorkout.equipment} />
            
            {/* Benefits Section */}
            <WorkoutBenefits benefits={selectedWorkout.benefits} />
            
            <div className="mb-8">
              <motion.h3 
                className="text-lg font-semibold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Workout Flow
              </motion.h3>
              
              {/* Progress Section */}
              <WorkoutProgress 
                activeExerciseIndex={activeExerciseIndex}
                totalExercises={selectedWorkout.exercises.length}
                calculateTotalDuration={calculateTotalDuration}
                exercises={selectedWorkout.exercises}
              />
              
              <ExerciseView
                exercise={selectedWorkout.exercises[activeExerciseIndex]}
                activeExerciseIndex={activeExerciseIndex}
                totalExercises={selectedWorkout.exercises.length}
                showInstructions={showInstructions}
                toggleInstructions={toggleInstructions}
                instructions={getCurrentExerciseInstructions()}
                onPrev={() => setActiveExerciseIndex(prev => Math.max(0, prev - 1))}
                onNext={() => setActiveExerciseIndex(prev => Math.min(selectedWorkout.exercises.length - 1, prev + 1))}
                startBreakTimer={startBreakTimer}
              />
            </div>
            
            <div className="flex justify-end">
              <MotionButton 
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Close Workout
              </MotionButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkoutDetailModal;
