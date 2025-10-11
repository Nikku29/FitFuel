
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface TimerState {
  time: number;
  isRunning: boolean;
  isBreakTime: boolean;
  breakTime: number;
}

export interface TimerActions {
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  startBreakTimer: () => void;
}

export const useWorkoutTimer = (): [TimerState, TimerActions] => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakTime, setBreakTime] = useState(60); // Default 60 seconds break
  
  // Timer effect
  useEffect(() => {
    let interval: any;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (isBreakTime) {
      interval = setInterval(() => {
        setBreakTime(prevTime => {
          if (prevTime <= 1) {
            setIsBreakTime(false);
            setIsRunning(true);
            return 60; // Reset break time
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isBreakTime]);
  
  // Timer controls
  const startTimer = () => {
    setIsRunning(true);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  const stopTimer = () => {
    setIsRunning(false);
    setTime(0);
  };
  
  const startBreakTimer = () => {
    setIsRunning(false);
    setIsBreakTime(true);
    toast({
      title: "Break Time Started",
      description: `Take a ${breakTime} second break before the next exercise.`,
    });
  };

  return [
    { time, isRunning, isBreakTime, breakTime },
    { startTimer, pauseTimer, stopTimer, startBreakTimer }
  ];
};
