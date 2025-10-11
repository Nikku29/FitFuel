
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import WorkoutCard from '../WorkoutCard';
import { Workout } from '@/types';

const mockWorkout: Workout = {
  id: 1,
  title: 'Test Workout',
  description: 'A test workout description',
  image: 'test-image.jpg',
  duration: '30 minutes',
  calories: 250,
  level: 'beginner' as const,
  type: 'strength',
  exercises: [
    {
      name: 'Push-ups',
      duration: '10 reps',
      description: 'Standard push-ups'
    }
  ],
  equipment: ['None'],
  benefits: ['Strength building']
};

describe('WorkoutCard', () => {
  const mockOnSelectWorkout = vi.fn();

  beforeEach(() => {
    mockOnSelectWorkout.mockClear();
  });

  it('renders workout information correctly', () => {
    render(
      <WorkoutCard 
        workout={mockWorkout} 
        onSelectWorkout={mockOnSelectWorkout} 
      />
    );

    expect(screen.getByText('Test Workout')).toBeInTheDocument();
    expect(screen.getByText('A test workout description')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('250 cal')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('1 exercises')).toBeInTheDocument();
  });

  it('calls onSelectWorkout when Start Workout button is clicked', () => {
    render(
      <WorkoutCard 
        workout={mockWorkout} 
        onSelectWorkout={mockOnSelectWorkout} 
      />
    );

    const startButton = screen.getByRole('button', { name: /start workout/i });
    fireEvent.click(startButton);

    expect(mockOnSelectWorkout).toHaveBeenCalledWith(mockWorkout);
  });

  it('displays correct level badge color for beginner', () => {
    render(
      <WorkoutCard 
        workout={mockWorkout} 
        onSelectWorkout={mockOnSelectWorkout} 
      />
    );

    const badge = screen.getByText('Beginner');
    expect(badge).toHaveClass('bg-green-500');
  });

  it('displays correct level badge color for advanced', () => {
    const advancedWorkout: Workout = { ...mockWorkout, level: 'advanced' as const };
    render(
      <WorkoutCard 
        workout={advancedWorkout} 
        onSelectWorkout={mockOnSelectWorkout} 
      />
    );

    const badge = screen.getByText('Advanced');
    expect(badge).toHaveClass('bg-red-500');
  });
});
