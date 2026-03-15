
export interface ExerciseTag {
    equipment: 'none' | 'dumbbell' | 'barbell' | 'kettlebell' | 'machine' | 'band';
    muscle: string;
    type: 'isometric' | 'dynamic';
    view: 'front' | 'side' | 'perspective';
    base_movement?: string;
    pose?: 'horizontal_prone' | 'standing_squat' | 'standing_press' | 'seated_row' | 'vertical_hang' | 'seated_twist' | 'supine_leg_lift' | 'side_plank' | 'cobra'; // For Procedural Engine
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
    'side plank': { equipment: 'none', muscle: 'obliques', type: 'isometric', view: 'front', base_movement: 'plank', pose: 'side_plank' },
    'russian twist': { equipment: 'none', muscle: 'obliques', type: 'dynamic', view: 'perspective', base_movement: 'seated_twist', pose: 'seated_twist' },
    'leg raise': { equipment: 'none', muscle: 'core', type: 'dynamic', view: 'side', base_movement: 'supine_leg_lift', pose: 'supine_leg_lift' },
    'cobra': { equipment: 'none', muscle: 'back', type: 'isometric', view: 'side', base_movement: 'cobra', pose: 'cobra' },

    // Cardio
    'burpees': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'jumping jacks': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'front', pose: 'standing_squat' },

    // Generic categories (e.g. "Standing Poses", "Floor Work")
    'standing poses': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'front', pose: 'standing_squat' },
    'floor work': { equipment: 'none', muscle: 'core', type: 'dynamic', view: 'side', pose: 'horizontal_prone' },
    'standing pose': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'front', pose: 'standing_squat' },
    'floor exercise': { equipment: 'none', muscle: 'core', type: 'dynamic', view: 'side', pose: 'horizontal_prone' },
    'yoga': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'cobra' },
    'stretch': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'hiit': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'standing_squat' },
    'cardio': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'side', pose: 'standing_squat' },

    // Fallback defaults
    'default': { equipment: 'none', muscle: 'full', type: 'dynamic', view: 'perspective', pose: 'standing_squat' }
};

export const getExerciseTag = (name: string): ExerciseTag => {
    const normalized = name.toLowerCase().trim();

    // Direct match
    if (EXERCISE_TAGS[normalized]) return EXERCISE_TAGS[normalized];

    // Partial match (order matters: more specific first)
    if (normalized.includes('plank') && !normalized.includes('side')) return EXERCISE_TAGS['plank'];
    if (normalized.includes('side plank')) return EXERCISE_TAGS['side plank'];
    if (normalized.includes('russian twist')) return EXERCISE_TAGS['russian twist'];
    if (normalized.includes('leg raise')) return EXERCISE_TAGS['leg raise'];
    if (normalized.includes('cobra')) return EXERCISE_TAGS['cobra'];
    if (normalized.includes('seated twist') || normalized.includes('twist')) return EXERCISE_TAGS['russian twist'];
    if (normalized.includes('supine') || normalized.includes('leg lift')) return EXERCISE_TAGS['leg raise'];
    if (normalized.includes('pull') || normalized.includes('lat pulldown') || normalized.includes('hang')) return EXERCISE_TAGS['pull-up'];
    if (normalized.includes('row')) return EXERCISE_TAGS['dumbbell row'];
    if (normalized.includes('deadlift')) return EXERCISE_TAGS['deadlift'];
    if (normalized.includes('lunge')) return EXERCISE_TAGS['lunge'];
    if (normalized.includes('goblet')) return EXERCISE_TAGS['goblet squat'];
    if (normalized.includes('squat') || normalized.includes('standing pose')) return EXERCISE_TAGS['squat'];
    if (normalized.includes('wall sit')) return EXERCISE_TAGS['wall sit'];
    if (normalized.includes('burpee') || normalized.includes('jumping jack')) return EXERCISE_TAGS['burpees'];
    if (normalized.includes('shoulder press')) return EXERCISE_TAGS['shoulder press'];
    if (normalized.includes('dumbbell') && normalized.includes('press')) return EXERCISE_TAGS['dumbbell press'];
    if (normalized.includes('bench') || normalized.includes('press')) return EXERCISE_TAGS['bench press'];
    if (normalized.includes('push')) return EXERCISE_TAGS['push-up'];
    if (normalized.includes('floor') || normalized.includes('floor work')) return EXERCISE_TAGS['floor work'];
    if (normalized.includes('standing')) return EXERCISE_TAGS['standing poses'];
    if (normalized.includes('yoga') || normalized.includes('stretch')) return EXERCISE_TAGS['yoga'];
    if (normalized.includes('hiit') || normalized.includes('cardio')) return EXERCISE_TAGS['hiit'];

    return EXERCISE_TAGS['default'];
};

export const isDefaultTag = (tag: ExerciseTag): boolean =>
    tag.muscle === 'full' && tag.view === 'perspective' && tag.pose === 'standing_squat';
