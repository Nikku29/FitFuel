import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX, CheckCircle, Clock, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Workout, Exercise } from '@/types';
// import confetti from 'canvas-confetti';

interface ActiveWorkoutSessionProps {
    workout: Workout;
    onComplete: () => void;
    onClose: () => void;
}

type StepType = 'prep' | 'work' | 'rest' | 'finished';

interface WorkoutStep {
    type: StepType;
    exercise?: Exercise;
    duration: number; // in seconds (0 for manual)
    name: string;
    description?: string;
    nextName?: string;
    reps?: string;
    sets?: number;
}

// Helper to parse duration string "3 mins" -> 180
const parseDuration = (dur: string | undefined): number => {
    if (!dur) return 60; // Default 1 min
    const parts = dur.split(' ');
    const val = parseInt(parts[0]);
    if (parts.length > 1) {
        if (parts[1].startsWith('min')) return val * 60;
        if (parts[1].startsWith('sec')) return val;
    }
    return val;
};

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
    workout,
    onComplete,
    onClose,
}) => {
    const { speak, stop } = useTextToSpeech();
    const [isMuted, setIsMuted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10); // Start with prep
    const [isActive, setIsActive] = useState(false);

    // Generate steps from workout data
    const steps = useMemo(() => {
        const s: WorkoutStep[] = [];
        // Initial Prep
        s.push({
            type: 'prep',
            duration: 10,
            name: 'Get Ready',
            description: `Up first: ${workout.exercises[0]?.name}`,
            nextName: workout.exercises[0]?.name
        });

        workout.exercises.forEach((ex, index) => {
            const sets = ex.sets || 1;
            const rest = ex.restTime || 30;
            const duration = ex.duration ? parseDuration(ex.duration) : 0; // 0 for manual Rep-based

            for (let i = 0; i < sets; i++) {
                // Work Step
                s.push({
                    type: 'work',
                    exercise: ex,
                    duration: duration,
                    name: ex.name,
                    reps: ex.reps,
                    sets: i + 1,
                    description: ex.description,
                    nextName: i < sets - 1 ? 'Rest' : (workout.exercises[index + 1]?.name || 'Finished')
                });

                // Rest Step (unless it's the very last thing)
                if (i < sets - 1 || index < workout.exercises.length - 1) {
                    s.push({
                        type: 'rest',
                        duration: rest,
                        name: 'Rest',
                        description: 'Take a breather',
                        nextName: i < sets - 1 ? ex.name : (workout.exercises[index + 1]?.name || 'Finished')
                    });
                }
            }
        });

        s.push({
            type: 'finished',
            duration: 0,
            name: 'Workout Complete',
            description: 'Great job!'
        });

        return s;
    }, [workout]);

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;
    const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

    const finishWorkout = useCallback(() => {
        /* confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#ec4899', '#ffffff']
        }); */
        setTimeout(onComplete, 2000);
    }, [onComplete]);

    const handleNextStep = useCallback(() => {
        if (currentStepIndex >= steps.length - 1) {
            finishWorkout();
            return;
        }

        const nextIndex = currentStepIndex + 1;
        const nextStep = steps[nextIndex];

        setCurrentStepIndex(nextIndex);
        setTimeLeft(nextStep.duration);

        // Voice Cues
        if (!isMuted) {
            if (nextStep.type === 'work') {
                const setMap = nextStep.exercise?.sets && nextStep.exercise.sets > 1 ? `Set ${nextStep.sets}.` : '';
                const repsText = nextStep.reps ? ` ${nextStep.reps} reps.` : '';
                const startText = nextStep.duration > 0 ? 'Go.' : 'Begin.';
                speak(`${nextStep.name}. ${setMap}${repsText} ${startText}`);
            } else if (nextStep.type === 'rest') {
                speak(`Rest for ${nextStep.duration} seconds. Next up: ${nextStep.nextName}`);
            } else if (nextStep.type === 'finished') {
                speak('Workout complete. Congratulations!');
                finishWorkout();
            }
        }
    }, [currentStepIndex, steps, isMuted, speak, finishWorkout]);

    // Initialize
    useEffect(() => {
        setIsActive(true);
        setTimeLeft(steps[0].duration);
        if (!isMuted) speak(`Starting ${workout.title}. Get ready for ${steps[0].nextName}`);
        return () => stop();
    }, []); // Run once on mount

    // Timer Logic
    useEffect(() => {
        let interval: any = null;
        if (isActive && currentStep.type !== 'finished') {
            interval = setInterval(() => {
                // Only decrement if duration > 0 (timed step)
                if (currentStep.duration > 0) {
                    setTimeLeft((time) => {
                        if (time <= 1) {
                            handleNextStep();
                            return 0;
                        }
                        // Voice countdown
                        if (!isMuted && time <= 4 && time > 1) {
                            speak((time - 1).toString(), 1.2);
                        }
                        return time - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, currentStep, isMuted, speak, handleNextStep]);

    const togglePause = () => {
        setIsActive(!isActive);
        if (!isMuted) speak(isActive ? "Paused" : "Resuming");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-500 text-purple-600">
                        {currentStep.type === 'work' ? 'EXERCISE' : currentStep.type.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-gray-800 hidden sm:inline">{workout.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX className="text-gray-400" /> : <Volume2 className="text-purple-600" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="text-gray-500" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center w-full max-w-md"
                    >
                        {/* Step Info */}
                        <h2 className="text-2xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                            {currentStep.name}
                        </h2>

                        {currentStep.reps && (
                            <div className="mb-4">
                                <Badge className="text-lg py-1 px-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                    {currentStep.reps} Reps
                                </Badge>
                            </div>
                        )}

                        <p className="text-xl text-gray-600 mb-8 h-12 line-clamp-2">
                            {currentStep.description}
                        </p>

                        {/* Timer or Reps Confirmation */}
                        <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
                            {/* Circular Progress */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                {currentStep.duration > 0 && (
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke={currentStep.type === 'rest' ? '#10b981' : '#9333ea'}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 120}
                                        strokeDashoffset={2 * Math.PI * 120 * (1 - timeLeft / (currentStep.duration || 1))}
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                )}
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {currentStep.duration > 0 ? (
                                    <span className="text-6xl font-bold tabular-nums">
                                        {formatTime(timeLeft)}
                                    </span>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="rounded-full w-24 h-24 bg-purple-600 hover:bg-purple-700 text-white shadow-xl"
                                        onClick={handleNextStep}
                                    >
                                        <CheckCircle size={40} />
                                    </Button>
                                )}
                                {currentStep.duration > 0 && (
                                    <span className="text-gray-500 mt-2 font-medium">
                                        {currentStep.type === 'rest' ? 'Resting...' : 'Time Remaining'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Up Next Preview */}
                        {!isLastStep && (
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                                <div className="text-left">
                                    <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">UP NEXT</p>
                                    <p className="font-semibold text-gray-800">{currentStep.nextName}</p>
                                </div>
                                <ChevronRight className="text-gray-300" />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Controls */}
            <div className="bg-white border-t p-6 pb-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-6 mb-6">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 w-16 rounded-full border-2"
                            onClick={togglePause}
                        >
                            {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                        </Button>

                        {currentStep.duration > 0 && (
                            <Button
                                variant="secondary"
                                size="lg"
                                className="h-14 px-8 rounded-full font-semibold"
                                onClick={handleNextStep}
                            >
                                Skip <SkipForward size={18} className="ml-2" />
                            </Button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};
