
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { toast } from "@/hooks/use-toast";
import { aiService, PersonalizedWorkout } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertCircle, Dumbbell, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import workout data
import { workoutData, exerciseInstructions } from '@/data/workoutData';

// Import refactored components
import WorkoutDetailModal from '@/components/workouts/WorkoutDetailModal';
import WorkoutHeader from '@/components/workouts/WorkoutHeader';
import SearchAndFilter from '@/components/workouts/SearchAndFilter';
import WorkoutGrid from '@/components/workouts/WorkoutGrid';
import { useWorkoutTimer } from '@/components/workouts/WorkoutTimerLogic';
import { filterWorkouts } from '@/utils/workoutFilters';

const WorkoutsPage = () => {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [aiWorkouts, setAiWorkouts] = useState<PersonalizedWorkout[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiWorkouts, setShowAiWorkouts] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  
  // Use the workout timer hook
  const [timerState, timerActions] = useWorkoutTimer();
  
  // Check AI configuration on component mount
  useEffect(() => {
    const config = aiService.getConfigurationStatus();
    setAiConfigured(config.configured);
  }, []);

  // Generate AI workouts when user data is available
  const generateAiWorkouts = async () => {
    if (!aiConfigured || !userData || loadingAi) return;
    
    setLoadingAi(true);
    try {
      const personalizedWorkouts = await aiService.generatePersonalizedWorkouts(userData, 4);
      setAiWorkouts(personalizedWorkouts);
      setShowAiWorkouts(true);
      toast({
        title: "AI Workouts Generated!",
        description: "Your personalized workouts are ready.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to Generate Workouts",
        description: "Using fallback recommendations instead.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Combine AI workouts with static workouts
  const allWorkouts = showAiWorkouts ? [...aiWorkouts, ...workoutData] : workoutData;
  
  // Filter workouts based on search term and active tab
  const filteredWorkouts = filterWorkouts(allWorkouts, searchTerm, currentTab);

  // Handler for selecting a workout
  const handleSelectWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    timerActions.stopTimer();
    toast({
      title: "Workout Ready",
      description: "Get ready to start your workout session!",
      duration: 3000,
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-white to-purple-100 py-4 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <WorkoutHeader userData={userData} />

          {/* AI Workout Generation */}
          {aiConfigured ? (
            <Card className="border-2 border-fitfuel-purple/20 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-fitfuel-purple p-2 rounded-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI-Personalized Workouts</h3>
                      <p className="text-gray-600 text-sm">
                        Get workouts tailored to your {userData?.fitnessGoal?.toLowerCase() || 'fitness'} goals and {userData?.activityLevel || 'fitness'} level
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!showAiWorkouts && (
                      <Button 
                        onClick={generateAiWorkouts}
                        disabled={loadingAi || !userData}
                        className="bg-fitfuel-purple hover:bg-fitfuel-purple/90"
                      >
                        {loadingAi ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Workouts
                          </>
                        )}
                      </Button>
                    )}
                    {showAiWorkouts && (
                      <Button 
                        onClick={generateAiWorkouts}
                        disabled={loadingAi}
                        variant="outline"
                        className="border-fitfuel-purple text-fitfuel-purple hover:bg-fitfuel-purple/10"
                      >
                        {loadingAi ? 'Regenerating...' : 'Regenerate'}
                      </Button>
                    )}
                  </div>
                </div>
                {!userData && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please complete your profile to generate personalized workouts. <Link to="/profile" className="text-fitfuel-purple underline">Update Profile</Link>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AI workout generation is not configured. Add your API key to enable personalized recommendations.
              </AlertDescription>
            </Alert>
          )}

          {/* AI Generated Workouts Loading */}
          {loadingAi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search and Filter */}
          <SearchAndFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />

          {/* Workouts Grid */}
          <WorkoutGrid 
            filteredWorkouts={filteredWorkouts}
            onSelectWorkout={handleSelectWorkout}
          />
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          selectedWorkout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          exerciseInstructions={exerciseInstructions}
          time={timerState.time}
          isRunning={timerState.isRunning}
          isBreakTime={timerState.isBreakTime}
          breakTime={timerState.breakTime}
          startTimer={timerActions.startTimer}
          pauseTimer={timerActions.pauseTimer}
          stopTimer={timerActions.stopTimer}
          startBreakTimer={timerActions.startBreakTimer}
        />
      )}
    </motion.div>
  );
};

export default WorkoutsPage;
