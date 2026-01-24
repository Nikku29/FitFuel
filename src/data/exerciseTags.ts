
export interface ExerciseTag {
    equipment: 'none' | 'dumbbell' | 'barbell' | 'kettlebell' | 'machine' | 'band';
    muscle: string;
    type: 'isometric' | 'dynamic';
    view: 'front' | 'side' | 'perspective';
    base_movement?: string;
    pose?: 'horizontal_prone' | 'standing_squat' | 'standing_press' | 'seated_row' | 'vertical_hang'; // For Procedural Engine
}

export const EXERCISE_TAGS: Record<string, ExerciseTag> = {
    // Push
    'push-up': { equipment: 'none', muscle: 'chest', type: 'dynamic', view: 'side', base_movement: 'push-up', pose: 'horizontal_prone' },
    'bench press': { equipment: 'barbell', muscle: 'chest', type: 'dynamic', view: 'perspective', pose: 'horizontal_prone' },
    'dumbbell press': { equipment: 'dumbbell', muscle: 'chest', type: 'dynamic', view: 'perspective', base_movement: 'bench press', pose: 'horizontal_prone' },
    'shoulder press': { equipment: 'dumbbell', muscle: 'shoulders', type: 'dynamic', view: 'front', pose: 'standing_press' },

    // Pull
    'pull-up': { equipment: 'none', muscle: 'back', type: 'dynamic', view: 'perspective', pose: 'vertical_hang' },
    'lat pulldown': { equipment: 'machine', muscle: 'back', type: 'dynamic', view: 'perspective', base_movement: 'pull-up', pose: 'vertical_hang' },
    'dumbbell row': { equipment: 'dumbbell', muscle: 'back', type: 'dynamic', view: 'side', pose: 'seated_row' },

    // Legs
    'squat': { equipment: 'none', muscle: 'quads', type: 'dynamic', view: 'front', base_movement: 'squat', pose: 'standing_squat' },
    'goblet squat': { equipment: 'dumbbell', muscle: 'quads', type: 'dynamic', view: 'front', base_movement: 'squat', pose: 'standing_squat' },
    'lunge': { equipment: 'none', muscle: 'quads', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'deadlift': { equipment: 'barbell', muscle: 'hamstrings', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'wall sit': { equipment: 'none', muscle: 'quads', type: 'isometric', view: 'side', base_movement: 'squat', pose: 'standing_squat' },

    // Core
    'plank': { equipment: 'none', muscle: 'core', type: 'isometric', view: 'side', base_movement: 'plank', pose: 'horizontal_prone' },
    'side plank': { equipment: 'none', muscle: 'obliques', type: 'isometric', view: 'front', base_movement: 'plank', pose: 'horizontal_prone' },
    'russian twist': { equipment: 'none', muscle: 'obliques', type: 'dynamic', view: 'perspective', pose: 'seated_row' },

    // Cardio
    'burpees': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'jumping jacks': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'front', pose: 'standing_squat' },

    // Fallback defaults
    'default': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'perspective', pose: 'standing_squat' }
};

export const getExerciseTag = (name: string): ExerciseTag => {
    const normalized = name.toLowerCase().trim();

    // Direct match
    if (EXERCISE_TAGS[normalized]) return EXERCISE_TAGS[normalized];

    // Partial match logic (heuristics)
    if (normalized.includes('plank')) return EXERCISE_TAGS['plank'];
    if (normalized.includes('squat')) return EXERCISE_TAGS['squat'];
    if (normalized.includes('press')) return { equipment: normalized.includes('dumb') ? 'dumbbell' : 'barbell', muscle: 'chest', type: 'dynamic', view: 'perspective' };

    return EXERCISE_TAGS['default'];
};
