
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkoutTimerProps {
  isBreakTime: boolean;
  breakTime: number;
  time: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onBreak: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  isBreakTime,
  breakTime,
  time,
  isRunning,
  onStart,
  onPause,
  onStop,
  onBreak
}) => {
  // Format time to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-center">Workout Timer</h3>
      <div className="text-3xl font-bold text-center mb-3">
        {isBreakTime ? `Break: ${formatTime(breakTime)}` : formatTime(time)}
      </div>
      <div className="flex justify-center space-x-2 mb-4">
        {!isRunning && !isBreakTime ? (
          <Button onClick={onStart} variant="default" className="flex items-center">
            <Play className="mr-1 h-4 w-4" /> Start
          </Button>
        ) : (
          <Button onClick={onPause} variant="outline" className="flex items-center" disabled={isBreakTime}>
            <Pause className="mr-1 h-4 w-4" /> Pause
          </Button>
        )}
        <Button onClick={onStop} variant="outline" className="flex items-center" disabled={isBreakTime}>
          <Square className="mr-1 h-4 w-4" /> Reset
        </Button>
        <Button 
          onClick={onBreak} 
          variant="outline" 
          className="flex items-center"
          disabled={isBreakTime}
        >
          Break Time
        </Button>
      </div>
    </div>
  );
};

export default WorkoutTimer;
