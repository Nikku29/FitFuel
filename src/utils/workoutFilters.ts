
// Filter workouts based on search term and active tab
export const filterWorkouts = (workouts: any[], searchTerm: string, currentTab: string) => {
  return workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        workout.type.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    
    return matchesSearch;
  });
};
