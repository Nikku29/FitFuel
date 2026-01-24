export interface AIRecommendation {
    id?: string;
    type: 'workout' | 'recipe' | 'dashboard';
    title: string;
    description: string;
    content: any;
    personalizedFor: string[];
}

export interface PersonalizedWorkout {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    category: string;
    exercises: {
        name: string;
        duration?: string;
        reps?: string;
        sets?: string;
        description: string;
        targetMuscles: string[];
    }[];
    benefits: string[];
    equipment: string[];
    calories: number;
    trainerNote?: string;
    readinessScore?: number;
}

export interface PersonalizedRecipe {
    id: string;
    title: string;
    description: string;
    prepTime: string;
    calories: number;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan';
    tags: string[];
    ingredients: string[];
    steps: string[];
    nutritionFacts: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    chefNote?: string;
}

export interface DashboardInsights {
    personalizedTip: string;
    recommendedAction: string;
    progressAnalysis: string;
    motivationalMessage: string;
}

export interface TrainerContext {
    readiness_score: number; // 1-10
    focus_mode: 'Active_Recovery' | 'Hypertrophy' | 'Strength' | 'Endurance' | 'Mobility' | 'Balanced';
    contraindicated_patterns: string[];
    available_time: number;
}

export interface AIChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
