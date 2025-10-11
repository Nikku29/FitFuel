
import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

// Define a simplified type that matches what we need from UserData
interface WorkoutHeaderProps {
  userData: {
    fitnessGoal?: string;
  };
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ userData }) => {
  return (
    <motion.div 
      className="flex flex-col space-y-2"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Workout Library</h1>
      <p className="text-gray-600">
        Discover effective workout routines for all fitness levels with FitFusion.
        {userData.fitnessGoal && (
          <span className="font-medium"> Optimized for your {userData.fitnessGoal.replace('-', ' ')} goal.</span>
        )}
      </p>
      <p className="text-sm text-purple-600 italic">
        Note: This collection will be updated with personalized recommendations after you interact with our AI Assistant.
      </p>
    </motion.div>
  );
};

export default WorkoutHeader;
