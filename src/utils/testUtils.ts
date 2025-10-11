// Test utilities for comprehensive testing

export const mockWorkout = {
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

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockUserProfile = {
  id: 'profile-id',
  userId: 'test-user-id',
  displayName: 'Test User',
  bio: 'Test bio',
  fitnessGoals: ['lose weight', 'build muscle'],
  preferredWorkoutTypes: ['strength', 'cardio'],
  fitnessLevel: 'beginner' as const,
  height: 170,
  weight: 70,
  age: 25,
  allergies: 'none',
  medicalConditions: 'none',
  activityRestrictions: 'none',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock performance API
export const mockPerformanceAPI = () => {
  const mockPerformance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    clearMeasures: () => {},
    clearMarks: () => {},
  };

  return mockPerformance;
};