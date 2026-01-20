
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import LottieWorkoutAnimation from './LottieWorkoutAnimation';
import { getWorkoutAnimation } from '@/data/workoutAnimationMap';
import { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout | any; // Allow both Workout and AI workout types
  onSelectWorkout: (workout: Workout | any) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onSelectWorkout }) => {
  // More vibrant color mapping for workout levels
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-yellow-500 text-white';
      case 'advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-purple-500 text-white';
    }
  };

  const animationUrl = getWorkoutAnimation(workout.title);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-purple-200 h-full flex flex-col">
        {/* Mobile Layout: Animation on top, Desktop Layout: Side by side */}
        <div className="flex flex-col md:flex-row">
          {/* Lottie Animation Section */}
          <div className="flex justify-center items-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 md:w-1/3">
            <LottieWorkoutAnimation
              animationUrl={animationUrl}
              className="w-[120px] h-[120px] md:w-[160px] md:h-[160px]"
            />
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg md:text-xl text-purple-800 leading-tight">{workout.title}</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {String(workout.id).startsWith('ai-') && (
                    <Badge className="text-xs font-medium bg-fitfuel-purple text-white flex-shrink-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                  <Badge className={`text-xs font-medium ${getLevelColor(workout.level || workout.difficulty)} flex-shrink-0`}>
                    {(workout.level || workout.difficulty)?.charAt(0).toUpperCase() + (workout.level || workout.difficulty)?.slice(1)}
                  </Badge>
                </div>
              </div>
              <CardDescription className="line-clamp-2 text-gray-600 text-sm">{workout.description}</CardDescription>
            </CardHeader>

            <CardContent className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 flex-1">
              <div className="flex items-center space-x-4 text-sm text-gray-700 mb-2">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-purple-600" />
                  <span>{workout.duration}</span>
                </div>
                <div className="flex items-center">
                  <Flame size={16} className="mr-1 text-orange-500" />
                  <span>{workout.calories} cal</span>
                </div>
              </div>

              {/* Benefits / Muscles Preview */}
              <div className="space-y-2">
                {workout.benefits && workout.benefits.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {workout.benefits.slice(0, 2).map((benefit: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-[10px] px-1 py-0 border-purple-200 text-purple-600 bg-purple-50">
                        {benefit}
                      </Badge>
                    ))}
                    {workout.benefits.length > 2 && <span className="text-[10px] text-gray-400">+{workout.benefits.length - 2} more</span>}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-purple-700">{workout.exercises?.length || 0} exercises</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-purple-50 to-indigo-50 mt-auto">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onSelectWorkout(workout)}
              >
                <Activity className="mr-2 h-4 w-4" />
                Start Workout
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default WorkoutCard;
