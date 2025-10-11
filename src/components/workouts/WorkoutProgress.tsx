
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface WorkoutProgressProps {
  activeExerciseIndex: number;
  totalExercises: number;
  calculateTotalDuration: (exercises: any[]) => number;
  exercises: any[];
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({ 
  activeExerciseIndex, 
  totalExercises,
  calculateTotalDuration,
  exercises
}) => {
  return (
    <>
      <motion.div 
        className="flex justify-between items-center mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p>Progress: {activeExerciseIndex + 1} / {totalExercises}</p>
        <p>
          Time Elapsed: {calculateTotalDuration(exercises.slice(0, activeExerciseIndex))} min / 
          {calculateTotalDuration(exercises)} min
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Progress value={(activeExerciseIndex + 1) / totalExercises * 100} className="mb-4" />
      </motion.div>
    </>
  );
};

export default WorkoutProgress;
