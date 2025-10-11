
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface WorkoutInfoHeaderProps {
  workout: {
    title: string;
    level: string;
    type: string;
    duration: string;
    calories: number;
    image: string;
  };
}

const WorkoutInfoHeader: React.FC<WorkoutInfoHeaderProps> = ({
  workout
}) => {
  // Get background color based on workout type
  const getTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'cardio':
        return 'bg-red-500';
      case 'strength':
        return 'bg-blue-600';
      case 'yoga':
        return 'bg-green-600';
      case 'hiit':
        return 'bg-orange-500';
      case 'core':
        return 'bg-yellow-500';
      case 'mobility':
        return 'bg-teal-500';
      case 'warm-up':
        return 'bg-pink-500';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div className="relative h-40 flex items-center overflow-hidden border-b">
      <div className="absolute inset-0">
        <img
          src={workout.image}
          alt={workout.title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-60" />
      </div>
      <motion.div 
        className="relative p-6 text-white"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className={`${getTypeColor(workout.type)} text-white`}>
            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
          </Badge>
          <Badge className={workout.level === 'beginner' ? 'bg-green-500' : 
                           workout.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'}>
            {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
          </Badge>
        </div>
        <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{workout.title}</h2>
        <div className="flex gap-4 text-sm">
          <span>Duration: {workout.duration}</span>
          <span>Calories: {workout.calories}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkoutInfoHeader;
