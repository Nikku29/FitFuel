
// Filter workouts based on search term, active tab, AND user profile
export const filterWorkouts = (
  workouts: any[],
  searchTerm: string,
  currentTab: string,
  userData?: { activityLevel?: string; medicalConditions?: string } | null
) => {
  const isGuest = !userData?.activityLevel;

  return workouts.filter(workout => {
    // STEP 1: Profile enforcement (MANDATORY for logged-in users)
    if (!isGuest && userData) {
      // Beginners should NOT see Advanced workouts
      if (userData.activityLevel === 'Beginner' && workout.level === 'advanced') {
        return false; // BLOCK advanced for beginners
      }

      // Medical condition safety checks
      if (userData.medicalConditions) {
        const conditions = userData.medicalConditions.toLowerCase();
        const workoutType = (workout.type || '').toLowerCase();
        const workoutTitle = (workout.title || '').toLowerCase();

        // Knee issues: block high-impact workouts
        if (conditions.includes('knee') && (
          workoutType === 'hiit' ||
          workoutTitle.includes('jump') ||
          workoutTitle.includes('squat') ||
          workoutTitle.includes('lunge')
        )) {
          return false;
        }

        // Back issues: block heavy lifting
        if (conditions.includes('back') && (
          workoutTitle.includes('deadlift') ||
          workoutTitle.includes('heavy')
        )) {
          return false;
        }
      }
    }

    // STEP 2: Search term matching
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.type.toLowerCase().includes(searchTerm.toLowerCase());

    // STEP 3: Tab filtering (only for guests who have tabs visible)
    if (isGuest) {
      if (currentTab === 'all') return matchesSearch;
      if (currentTab === 'beginner') return matchesSearch && workout.level === 'beginner';
      if (currentTab === 'intermediate') return matchesSearch && workout.level === 'intermediate';
      if (currentTab === 'advanced') return matchesSearch && workout.level === 'advanced';
      if (currentTab === 'cardio') return matchesSearch && workout.type === 'cardio';
      if (currentTab === 'strength') return matchesSearch && workout.type === 'strength';
      if (currentTab === 'yoga') return matchesSearch && workout.type === 'yoga';
      if (currentTab === 'hiit') return matchesSearch && workout.type === 'hiit';
      if (currentTab === 'core') return matchesSearch && workout.type === 'core';
      if (currentTab === 'mobility') return matchesSearch && workout.type === 'mobility';
    }

    return matchesSearch;
  });
};
