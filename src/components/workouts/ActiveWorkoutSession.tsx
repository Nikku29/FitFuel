import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX, CheckCircle, X, ChevronRight, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAudioTrainer } from '@/hooks/useAudioTrainer';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { Workout, Exercise } from '@/types';
import { InstructionalSprite } from './InstructionalSprite';
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
    equipment?: string[];
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

import { db } from '@/integrations/firebase/config';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext';
import { SafetySanitizer } from '@/services/SafetySanitizer';

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
    workout,
    onComplete,
    onClose,
}) => {
    const { user } = useUser();
    const [isMuted, setIsMuted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const { speak, stop, protocols } = useAudioTrainer(isMuted);

    // 1. SAFETY FIREWALL (The Brain Guard)
    const safeWorkout = useMemo(() => {
        return SafetySanitizer.sanitizeSession(workout);
    }, [workout]);

    // Generate steps from workout data
    const steps = useMemo(() => {
        const s: WorkoutStep[] = [];

        safeWorkout.exercises.forEach((ex: any, index: number) => {
            const sets = parseInt(ex.sets) || 1;
            const rest = ex.rest_seconds || ex.restTime || 45; // Enhanced rest logic
            const duration = ex.duration ? parseDuration(ex.duration) : 0;

            for (let i = 0; i < sets; i++) {

                // 1. PREP STEP (5s fixed strictness)
                s.push({
                    type: 'prep',
                    duration: 5,
                    name: `Get Ready: ${ex.name}`,
                    description: i === 0 ? "First set. Let's go." : `Set ${i + 1} of ${sets}`,
                    exercise: ex,
                    reps: ex.reps,
                    equipment: ex.equipment
                });

                // 2. WORK STEP
                s.push({
                    type: 'work',
                    exercise: ex,
                    duration: duration,
                    name: ex.name,
                    reps: ex.reps,
                    sets: i + 1,
                    description: ex.description,
                    nextName: i < sets - 1 ? 'Rest' : (safeWorkout.exercises[index + 1]?.name || 'Finished'),
                    equipment: ex.equipment
                });

                // 3. REST STEP (unless it's the very last thing)
                if (i < sets - 1 || index < safeWorkout.exercises.length - 1) {
                    const nextExName = i < sets - 1 ? ex.name : (safeWorkout.exercises[index + 1]?.name || 'Finished');
                    const nextEq = i < sets - 1 ? ex.equipment : (safeWorkout.exercises[index + 1]?.equipment);

                    s.push({
                        type: 'rest',
                        duration: rest,
                        name: 'Rest',
                        description: `Recover. Next: ${nextExName}`,
                        nextName: nextExName,
                        exercise: i < sets - 1 ? ex : safeWorkout.exercises[index + 1],
                        equipment: nextEq
                    });
                }
            }
        });

        s.push({
            type: 'finished',
            duration: 0,
            name: 'Workout Complete',
            description: 'greatjob'
        });

        return s;
    }, [safeWorkout]);

    const currentStep = steps[currentStepIndex];
    const isStepActiveRef = React.useRef(false);

    // ... (Voice Command Handler remains the same) ...
    // Note: Re-implementing handleVoiceCommand to ensure context is correct if needed, but skipping for brevity if not changed essentially.
    // Actually, I need to keep the implementation consistent. The user requested replace helper, so I should be careful not to break existing methods.
    // I will replace `finishWorkout` logic next.

    const handleVoiceCommand = useCallback((command: string) => {
        console.log("Processing Voice Command:", command);
        if (command === 'NEXT') {
            handleTransition('next');
        } else if (command === 'PAUSE') {
            setIsActive(false);
            speak("Paused");
        } else if (command === 'RESUME') {
            setIsActive(true);
            speak("Resuming");
        } else if (command === 'EXPLAIN') {
            if (currentStep.exercise?.description) {
                speak(currentStep.exercise.description);
            }
        }
    }, [currentStep, speak, isActive]);

    // We only enable voice listening during REST and PREP to save battery/reduce noise
    const isListeningActive = isActive && (currentStep.type === 'rest' || currentStep.type === 'prep');

    const { isListening, lastCommand, error: voiceError } = useVoiceCommand({
        onCommand: handleVoiceCommand,
        isActive: isListeningActive
    });

    // ===========================================
    // TRANSITION LOGIC
    // ===========================================
    const handleTransition = useCallback((direction: 'next' | 'prev' = 'next') => {
        stop();

        if (direction === 'next') {
            if (currentStepIndex >= steps.length - 1) {
                finishWorkout();
                return;
            }
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            setTimeLeft(steps[nextIdx].duration);
            isStepActiveRef.current = false;
        }
    }, [currentStepIndex, steps, stop]);

    const finishWorkout = useCallback(async () => {
        protocols.announceComplete();

        // DASHBOARD LOOP: Write-back to Firestore
        if (user) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const totalBurn = safeWorkout.exercises.reduce((acc: number, ex: any) => {
                    // Simple MET placeholder: 5 kcal/min for now
                    const duration = ex.duration ? parseDuration(ex.duration) : 60; // Assume 1 min per set if rep based
                    const sets = parseInt(ex.sets) || 1;
                    return acc + (5 * (duration / 60) * sets);
                }, 0);

                const logRef = doc(db, 'users', user.uid, 'daily_logs', today);
                await setDoc(logRef, {
                    calories_burned: increment(totalBurn),
                    workouts_completed: increment(1),
                    last_updated: serverTimestamp()
                }, { merge: true });

                console.log(`[Dashboard] Synced stats. Burned ${totalBurn} kcal.`);
            } catch (e) {
                console.error("Failed to sync dashboard stats", e);
            }
        }

        setTimeout(onComplete, 2000);
    }, [onComplete, protocols, user, safeWorkout]);


    // ===========================================
    // STEP INITIALIZATION (Audio Cues)
    // ===========================================
    useEffect(() => {
        // This effect runs whenever currentStepIndex changes
        // It handles the "Entry" audio for the state
        if (isStepActiveRef.current) return;

        setIsActive(true);
        setTimeLeft(currentStep.duration);

        if (currentStep.type === 'rest') {
            protocols.announceRest(
                currentStep.duration,
                currentStep.nextName || 'Next Exercise',
                // Append suggestion if available
                currentStep.exercise && (currentStep.exercise as any).suggested_weight
                    ? [`Suggestion: Try ${(currentStep.exercise as any).suggested_weight}`]
                    : currentStep.equipment || []
            );
        } else if (currentStep.type === 'prep') {
            protocols.announcePrep(currentStep.duration);
        } else if (currentStep.type === 'work') {
            protocols.startWork();
        }

        isStepActiveRef.current = true;
    }, [currentStepIndex, currentStep, protocols]);


    // ===========================================
    // TIMER ENGINE
    // ===========================================
    useEffect(() => {
        let interval: any = null;
        if (isActive && currentStep.type !== 'finished') {
            interval = setInterval(() => {
                // Only decrement if duration > 0 (timed step)
                if (currentStep.duration > 0) {
                    setTimeLeft((time) => {
                        // 1. COUNTDOWN LOGIC (3-2-1)
                        if (currentStep.type !== 'work' && time <= 4 && time > 1) {
                            protocols.countDown(time - 1);
                        }

                        // 2. END OF TIMER
                        if (time <= 1) {
                            handleTransition('next');
                            return 0;
                        }
                        return time - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, currentStep, protocols, handleTransition]);

    const togglePause = () => {
        setIsActive(!isActive);
        speak(isActive ? "Paused" : "Resuming");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate progress
    const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col overflow-hidden font-sans">
            {/* 1. TOP BAR */}
            <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm z-20">
                <div className="flex items-center space-x-2">
                    <Badge
                        variant={currentStep.type === 'work' ? "default" : "secondary"}
                        className={currentStep.type === 'work' ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
                    >
                        {currentStep.type.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-gray-800 hidden sm:inline truncate max-w-[150px]">
                        {workout.title}
                    </span>
                </div>

                {/* Voice Status Indicator */}
                <div className="flex items-center gap-2">
                    {isListening ? (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            <Mic size={12} className="animate-pulse" /> Listening
                        </div>
                    ) : (
                        isListeningActive && (
                            <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs">
                                <MicOff size={12} /> Pro Tip: Say "Next"
                            </div>
                        )
                    )}

                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-purple-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X size={24} className="text-gray-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. MAIN VISUAL AREA */}
            <div className="flex-1 flex flex-col items-center justify-start p-2 md:p-6 relative overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-2xl flex flex-col items-center"
                    >
                        {/* INSTRUCTIONAL ASSET (The Smart Librarian) */}
                        {/* We show the detailed sprite logic based on phase */}
                        <div className="w-full mb-6">
                            <InstructionalSprite
                                exerciseName={currentStep.type === 'rest' && currentStep.nextName ? currentStep.nextName : currentStep.name.replace('Get Ready: ', '')}
                                category={currentStep.exercise?.type}
                                phase={currentStep.type === 'finished' ? 'rest' : currentStep.type}
                            />
                        </div>

                        {/* TEXT INFO */}
                        <h2 className={`text-3xl md:text-5xl font-black mb-2 text-center text-gray-900 leading-tight ${currentStep.type === 'prep' ? 'animate-pulse text-purple-600' : ''}`}>
                            {currentStep.name}
                        </h2>

                        <p className="text-xl text-gray-500 mb-6 font-medium text-center">
                            {currentStep.description}
                        </p>

                        {/* REPS BADGE */}
                        {currentStep.reps && (
                            <Badge className="text-xl py-2 px-6 mb-8 bg-purple-100 text-purple-800 border-purple-200">
                                {currentStep.reps} Reps
                            </Badge>
                        )}

                        {/* GIANT TIMER (Work/Rest) */}
                        <div
                            onClick={togglePause}
                            className={`relative cursor-pointer transition-transform active:scale-95 ${currentStep.type === 'work' ? 'scale-110' : ''}`}
                        >
                            {/* SVG Circle */}
                            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90 drop-shadow-2xl">
                                <circle
                                    cx="50%" cy="50%" r="45%"
                                    stroke="#ecf0f1" strokeWidth="12" fill="white"
                                />
                                {currentStep.duration > 0 && (
                                    <circle
                                        cx="50%" cy="50%" r="45%"
                                        stroke={currentStep.type === 'work' ? '#f43f5e' : '#10b981'}
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray="283%" // Approx
                                        strokeDashoffset={`${283 * (1 - timeLeft / (currentStep.duration || 1))}%`}
                                        className="transition-all duration-1000 ease-linear"
                                        style={{ strokeDasharray: 2 * Math.PI * 140 }} // better calc
                                    />
                                )}
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {currentStep.duration > 0 ? (
                                    <span className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums text-gray-800">
                                        {formatTime(timeLeft)}
                                    </span>
                                ) : (
                                    <CheckCircle size={80} className="text-purple-600 animate-bounce" />
                                )}
                                <span className="text-gray-400 font-bold tracking-widest mt-2 uppercase text-sm">
                                    {isActive
                                        ? (currentStep.type === 'rest'
                                            ? 'Resting'
                                            : `Set ${currentStep.sets || 1} of ${currentStep.exercise?.sets || 1}`)
                                        : 'Paused'}
                                </span>
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3. FOOTER CONTROLS */}
            <div className="bg-white border-t p-6 pb-10 z-20">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 w-16 rounded-full border-2 border-gray-200 hover:bg-gray-50"
                            onClick={togglePause}
                        >
                            {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                        </Button>

                        {/* Giant Hit Area for "Next" - Critical for Gym */}
                        <Button
                            variant="default" // Primary
                            size="lg"
                            className="flex-1 h-16 rounded-2xl text-xl font-bold bg-gray-900 hover:bg-gray-800 shadow-xl transition-all active:scale-95"
                            onClick={() => handleTransition('next')}
                        >
                            {currentStep.duration > 0 ? "Skip" : "Done"} <SkipForward size={24} className="ml-2" />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-gray-100" />
                    </div>
                </div>
            </div>
        </div>
    );
};
