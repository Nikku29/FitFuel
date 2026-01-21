
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
import NaturalLanguageInput from '@/components/ui/NaturalLanguageInput';

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
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

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

          {/* Natural Language Search */}
          {aiConfigured && (
            <div className="mb-6">
              <NaturalLanguageInput
                type="workout"
                placeholder="✨ Describe your ideal workout (e.g., 'Upper body strength, no equipment')"
                isLoading={loadingAi}
                onSearch={async (query) => {
                  setLoadingAi(true);
                  try {
                    const mode = userData?.activityLevel ? 'strict_profile' : 'guest';
                    const results = await aiService.generateFromNaturalLanguage(
                      userData,
                      query,
                      'workout',
                      mode
                    ) as PersonalizedWorkout[];
                    setAiWorkouts(results);
                    setShowAiWorkouts(true);
                    toast({
                      title: 'Workout Generated!',
                      description: `Created ${results.length} personalized workout(s) for you.`,
                    });
                  } catch (error) {
                    console.error('Workout generation failed:', error);
                    toast({
                      title: 'Generation Failed',
                      description: 'Could not generate workout. Try again.',
                      variant: 'destructive'
                    });
                  } finally {
                    setLoadingAi(false);
                  }
                }}
              />
            </div>
          )}

          {/* Profile Banner - Only for authenticated users */}
          {userData?.activityLevel && (
            <Alert className="mb-6 bg-purple-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Showing workouts personalized for your <strong>{userData.activityLevel}</strong> level and <strong>{userData.fitnessGoal || 'fitness'}</strong> goal.
                {userData.medicalConditions && <span className="ml-2">Avoiding exercises unsafe for: {userData.medicalConditions}</span>}
                <Link to="/profile" className="ml-2 underline">Update Profile</Link>
              </AlertDescription>
            </Alert>
          )}

          {/* AI Generator FAB */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={() => setIsGeneratorOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition-transform text-white flex items-center justify-center animate-bounce-slow"
            >
              <Dumbbell size={32} />
            </Button>
          </div>

          {/* Generator Modal */}
          {isGeneratorOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Design Session</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsGeneratorOpen(false)}>X</Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Time</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['15 min', '30 min', '45+ min'].map(t => (
                        <Button key={t} variant="outline" className="text-xs">{t}</Button>
                      ))}
                    </div>
                  </div>

                </div>

                <Button
                  className="w-full bg-fitfuel-purple text-white py-6 text-lg mt-4"
                  onClick={() => {
                    setIsGeneratorOpen(false);
                    generateAiWorkouts();
                  }}
                  disabled={loadingAi}
                >
                  {loadingAi ? 'Designing...' : 'Generate Plan'}
                </Button>
              </motion.div>
            </div>
          )}

          {/* Manual Log FAB (New) */}
          <div className="fixed bottom-6 left-6 z-40">
            <Button
              className="h-14 w-14 rounded-full shadow-xl bg-white text-purple-600 hover:bg-purple-50 border border-purple-200"
              onClick={() => toast({ title: "Manual Logging", description: "Manual workout logger coming soon!" })}
            >
              <span className="text-3xl font-light">+</span>
            </Button>
          </div>

          {/* AI Config Alert or Status */}
          {aiConfigured && !userData && (
            <Alert className="mt-4 bg-purple-50 border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Tip: Complete your profile for better AI accuracy. <Link to="/profile" className="underline">Update Profile</Link>
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

          {/* Search and Filter - Guest-Aware */}
          {!userData?.activityLevel && (
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          )}

          {/* Workouts Grid */}
          <WorkoutGrid
            filteredWorkouts={filteredWorkouts}
            onSelectWorkout={handleSelectWorkout}
          />
        </div>
      </div >

      {/* Workout Detail Modal */}
      {
        selectedWorkout && (
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
        )
      }
    </motion.div >
  );
};

export default WorkoutsPage;
