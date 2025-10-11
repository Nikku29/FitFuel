
import React from 'react';
import { motion } from 'framer-motion';
import WorkoutCard from '@/components/workouts/WorkoutCard';
import { Workout } from '@/types';

interface WorkoutGridProps {
  filteredWorkouts: (Workout | any)[]; // Allow both Workout and AI workout types
  onSelectWorkout: (workout: Workout | any) => void;
}

const WorkoutGrid: React.FC<WorkoutGridProps> = ({ filteredWorkouts, onSelectWorkout }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredWorkouts.length > 0 ? (
        filteredWorkouts.map((workout) => (
          <motion.div key={workout.id} variants={itemVariants} className="h-full">
            <WorkoutCard 
              workout={workout} 
              onSelectWorkout={onSelectWorkout}
            />
          </motion.div>
        ))
      ) : (
        <motion.div 
          className="col-span-full text-center py-8"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-lg">No workouts found. Try adjusting your search.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorkoutGrid;
