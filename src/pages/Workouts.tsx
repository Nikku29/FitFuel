
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useWorkoutScheduler } from '@/hooks/useWorkoutScheduler';
import QuoteLoader from '@/components/ui/QuoteLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, RefreshCw, Dumbbell, Play, Clock, Flame } from 'lucide-react';
import NaturalLanguageInput from '@/components/ui/NaturalLanguageInput';
import { toast } from "@/hooks/use-toast";
import WorkoutDetailModal from '@/components/workouts/WorkoutDetailModal';
import { useWorkoutTimer } from '@/components/workouts/WorkoutTimerLogic';
import { exerciseInstructions } from '@/data/workoutData';

const WorkoutsPage = () => {
  const { user, userData } = useUser();

  // Custom Hook Logic
  const { todaysWorkout, loading, loadingMessage, regenerateToday } = useWorkoutScheduler(user, userData);

  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [timerState, timerActions] = useWorkoutTimer();

  const handleStartWorkout = () => {
    // Transform "Daily Plan" format to "WorkoutDetail" format if needed
    // or just pass it direct if schema matches
    // The weekly plan has: { day, focus, exercises: [] }
    // The Modal expects: { title, exercises: [], ... }

    const workoutModel = {
      title: todaysWorkout.focus,
      exercises: todaysWorkout.exercises,
      duration: '45-60 min', // Estimate
      difficulty: userData?.activityLevel || 'Intermediate',
      calories: 300 // Estimate
    };

    setSelectedWorkout(workoutModel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Good Morning, {userData?.name ? userData.name.split(' ')[0] : 'Athlete'}.
          </h1>
          <p className="text-gray-500 mt-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Today is <span className="font-semibold text-purple-600 ml-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>.
          </p>
        </header>

        {/* MAIN CONTENT AREA */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
            <QuoteLoader message={loadingMessage} />
          </div>
        ) : todaysWorkout ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ACTIVE SESSION CARD */}
            <Card className="border-0 shadow-2xl bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Dumbbell className="w-64 h-64 text-purple-900" />
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-purple-600 tracking-wider uppercase mb-1">
                      TODAY'S MISSION
                    </p>
                    <CardTitle className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                      {todaysWorkout.focus}
                    </CardTitle>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Flame className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 relative z-10">
                <div className="flex gap-4 mb-8">
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>~45 Min</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    <span>{todaysWorkout.exercises?.length || 0} Exercises</span>
                  </div>
                </div>

                {/* Exercise Preview (First 3) */}
                <div className="space-y-3 mb-8">
                  {todaysWorkout.exercises?.slice(0, 3).map((ex: any, idx: number) => (
                    <div key={idx} className="flex items-center text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-3">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">{ex.sets} x {ex.reps}</span>
                    </div>
                  ))}
                  {todaysWorkout.exercises?.length > 3 && (
                    <p className="text-sm text-gray-400 pl-9">+ {todaysWorkout.exercises.length - 3} more</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pb-8 pt-0 relative z-10">
                <Button
                  className="w-full h-16 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                  onClick={handleStartWorkout}
                >
                  <Play className="w-5 h-5 mr-3 fill-current" />
                  Start Session
                </Button>
              </CardFooter>
            </Card>

            {/* THE AUDIBLE BAR (Adjustment) */}
            <div className="mt-8 bg-white/50 backdrop-blur-md rounded-xl p-6 border border-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Need to call an audible?
              </h3>
              <NaturalLanguageInput
                placeholder="I'm sore, give me a recovery session instead..."
                onSearch={(query) => regenerateToday(query)}
                type="workout"
              />
            </div>

          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No workout scheduled for today. Enjoy your rest!</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => regenerateToday("Generate a full body workout")}
            >
              Generate Manual Session
            </Button>
          </div>
        )}
      </div>

      {/* Workout Detail Modal (Reused) */}
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
    </div>
  );
};

export default WorkoutsPage;
