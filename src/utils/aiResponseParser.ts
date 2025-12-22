/**
 * AI Response Parser Utility
 * Comprehensive parsing and validation functions for AI-generated fitness plans
 */

/**
 * Interface definitions for fitness plan structures
 */
interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number | string;
  duration?: number; // in seconds
  intensity?: 'low' | 'moderate' | 'high';
  rest?: number; // in seconds
  notes?: string;
}

interface WorkoutDay {
  day: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed' | 'rest';
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  warmup?: string;
  cooldown?: string;
  notes?: string;
}

interface NutritionMeal {
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  ingredients?: string[];
  instructions?: string;
  timing?: string;
}

interface NutritionDay {
  date?: string;
  totalCalories: number;
  meals: NutritionMeal[];
  waterIntake?: number; // in liters
  notes?: string;
}

interface FitnessPlan {
  goal: string;
  duration: number; // in weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutPlan: WorkoutDay[];
  nutritionPlan: NutritionDay[];
  supplements?: string[];
  progressMetrics?: string[];
  warnings?: string[];
  startDate?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates individual exercise data
 */
function validateExercise(exercise: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!exercise.name || typeof exercise.name !== 'string') {
    errors.push('Exercise must have a valid name');
  }

  if (!Number.isInteger(exercise.sets) || exercise.sets < 1) {
    errors.push(`Exercise sets must be a positive integer, got: ${exercise.sets}`);
  }

  if (exercise.reps !== undefined) {
    const repsRegex = /^\d+(-\d+)?$/;
    if (!repsRegex.test(String(exercise.reps))) {
      warnings.push(`Exercise reps format unusual: ${exercise.reps}. Expected format: "10" or "8-12"`);
    }
  }

  if (exercise.duration !== undefined && (!Number.isInteger(exercise.duration) || exercise.duration < 0)) {
    errors.push(`Exercise duration must be a non-negative integer (seconds), got: ${exercise.duration}`);
  }

  if (exercise.intensity && !['low', 'moderate', 'high'].includes(exercise.intensity)) {
    warnings.push(`Unknown intensity level: ${exercise.intensity}`);
  }

  if (exercise.rest !== undefined && (!Number.isInteger(exercise.rest) || exercise.rest < 0)) {
    errors.push(`Rest period must be a non-negative integer (seconds), got: ${exercise.rest}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates workout day structure
 */
function validateWorkoutDay(day: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!day.day || typeof day.day !== 'string') {
    errors.push('Workout day must have a valid day name');
  }

  if (!day.type || !['cardio', 'strength', 'flexibility', 'mixed', 'rest'].includes(day.type)) {
    errors.push(`Invalid workout type: ${day.type}`);
  }

  if (!Number.isInteger(day.duration) || day.duration < 0) {
    errors.push(`Workout duration must be a non-negative integer (minutes), got: ${day.duration}`);
  }

  if (!Array.isArray(day.exercises)) {
    if (day.type !== 'rest') {
      errors.push('Workout day must have exercises array (except for rest days)');
    }
  } else if (day.exercises.length === 0 && day.type !== 'rest') {
    warnings.push(`${day.day} has no exercises defined but is not marked as rest day`);
  }

  if (Array.isArray(day.exercises)) {
    day.exercises.forEach((exercise, index) => {
      const exerciseValidation = validateExercise(exercise);
      if (!exerciseValidation.isValid) {
        errors.push(`Exercise ${index} (${exercise.name}): ${exerciseValidation.errors.join(', ')}`);
      }
      warnings.push(...exerciseValidation.warnings);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates nutrition meal data
 */
function validateMeal(meal: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!meal.name || typeof meal.name !== 'string') {
    errors.push('Meal must have a valid name');
  }

  if (!Number.isInteger(meal.calories) || meal.calories < 0) {
    errors.push(`Calories must be a non-negative integer, got: ${meal.calories}`);
  }

  if (!Number.isInteger(meal.protein) || meal.protein < 0) {
    errors.push(`Protein must be a non-negative integer (grams), got: ${meal.protein}`);
  }

  if (!Number.isInteger(meal.carbs) || meal.carbs < 0) {
    errors.push(`Carbs must be a non-negative integer (grams), got: ${meal.carbs}`);
  }

  if (!Number.isInteger(meal.fats) || meal.fats < 0) {
    errors.push(`Fats must be a non-negative integer (grams), got: ${meal.fats}`);
  }

  // Verify macro calculations roughly align with calories
  const calculatedCalories = (meal.protein * 4) + (meal.carbs * 4) + (meal.fats * 9);
  const caloriesDifference = Math.abs(calculatedCalories - meal.calories);
  const tolerance = meal.calories * 0.15; // 15% tolerance

  if (caloriesDifference > tolerance) {
    warnings.push(
      `Meal macros don't align with calories. Calculated: ${Math.round(calculatedCalories)}, Provided: ${meal.calories}`
    );
  }

  if (meal.ingredients && !Array.isArray(meal.ingredients)) {
    warnings.push('Meal ingredients should be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates nutrition day structure
 */
function validateNutritionDay(day: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isInteger(day.totalCalories) || day.totalCalories < 0) {
    errors.push(`Total calories must be a non-negative integer, got: ${day.totalCalories}`);
  }

  if (!Array.isArray(day.meals) || day.meals.length === 0) {
    errors.push('Nutrition day must have at least one meal');
  }

  if (Array.isArray(day.meals)) {
    let mealCaloriesTotal = 0;

    day.meals.forEach((meal, index) => {
      const mealValidation = validateMeal(meal);
      if (!mealValidation.isValid) {
        errors.push(`Meal ${index} (${meal.name}): ${mealValidation.errors.join(', ')}`);
      }
      warnings.push(...mealValidation.warnings);
      mealCaloriesTotal += meal.calories || 0;
    });

    const caloriesDifference = Math.abs(mealCaloriesTotal - day.totalCalories);
    if (caloriesDifference > day.totalCalories * 0.1) { // 10% tolerance
      warnings.push(
        `Daily calorie total mismatch. Sum of meals: ${mealCaloriesTotal}, Provided: ${day.totalCalories}`
      );
    }
  }

  if (day.waterIntake !== undefined && (typeof day.waterIntake !== 'number' || day.waterIntake < 0)) {
    warnings.push(`Water intake should be a non-negative number (liters), got: ${day.waterIntake}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates complete fitness plan structure
 */
function validateFitnessPlan(plan: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan.goal || typeof plan.goal !== 'string') {
    errors.push('Plan must have a valid goal');
  }

  if (!Number.isInteger(plan.duration) || plan.duration < 1) {
    errors.push(`Plan duration must be a positive integer (weeks), got: ${plan.duration}`);
  }

  if (!plan.difficulty || !['beginner', 'intermediate', 'advanced'].includes(plan.difficulty)) {
    errors.push(`Invalid difficulty level: ${plan.difficulty}`);
  }

  if (!Array.isArray(plan.workoutPlan) || plan.workoutPlan.length === 0) {
    errors.push('Plan must have a workout plan with at least one day');
  }

  if (Array.isArray(plan.workoutPlan)) {
    plan.workoutPlan.forEach((day, index) => {
      const dayValidation = validateWorkoutDay(day);
      if (!dayValidation.isValid) {
        errors.push(`Workout day ${index}: ${dayValidation.errors.join(', ')}`);
      }
      warnings.push(...dayValidation.warnings);
    });
  }

  if (!Array.isArray(plan.nutritionPlan) || plan.nutritionPlan.length === 0) {
    errors.push('Plan must have a nutrition plan with at least one day');
  }

  if (Array.isArray(plan.nutritionPlan)) {
    plan.nutritionPlan.forEach((day, index) => {
      const dayValidation = validateNutritionDay(day);
      if (!dayValidation.isValid) {
        errors.push(`Nutrition day ${index}: ${dayValidation.errors.join(', ')}`);
      }
      warnings.push(...dayValidation.warnings);
    });
  }

  // Validate supplements if provided
  if (plan.supplements && !Array.isArray(plan.supplements)) {
    warnings.push('Supplements should be an array of strings');
  }

  // Validate warnings if provided
  if (plan.warnings && !Array.isArray(plan.warnings)) {
    warnings.push('Warnings should be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Parses a string-based AI response into a FitnessPlan object
 */
function parseAIResponse(response: string): { plan: FitnessPlan | null; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let plan: FitnessPlan | null = null;

  if (!response || typeof response !== 'string') {
    errors.push('Response must be a non-empty string');
    return { plan: null, errors, warnings };
  }

  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      errors.push('No valid JSON object found in AI response');
      return { plan: null, errors, warnings };
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    plan = parsedData as FitnessPlan;
  } catch (error) {
    errors.push(`Failed to parse JSON from response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { plan: null, errors, warnings };
  }

  return { plan, errors, warnings };
}

/**
 * Comprehensive validation of parsed fitness plan
 */
function validateParsedPlan(plan: FitnessPlan): ValidationResult {
  return validateFitnessPlan(plan);
}

/**
 * Sanitizes and normalizes workout day data
 */
function normalizeWorkoutDay(day: any): WorkoutDay {
  return {
    day: day.day?.trim() || 'Unknown',
    type: day.type || 'mixed',
    duration: Math.max(0, Number(day.duration) || 0),
    exercises: (Array.isArray(day.exercises) ? day.exercises : []).map(normalizeExercise),
    warmup: day.warmup?.trim(),
    cooldown: day.cooldown?.trim(),
    notes: day.notes?.trim()
  };
}

/**
 * Sanitizes and normalizes exercise data
 */
function normalizeExercise(exercise: any): WorkoutExercise {
  return {
    name: exercise.name?.trim() || 'Unknown Exercise',
    sets: Math.max(1, Math.floor(Number(exercise.sets) || 1)),
    reps: exercise.reps || '10',
    duration: exercise.duration ? Math.max(0, Number(exercise.duration)) : undefined,
    intensity: exercise.intensity || undefined,
    rest: exercise.rest ? Math.max(0, Number(exercise.rest)) : undefined,
    notes: exercise.notes?.trim()
  };
}

/**
 * Sanitizes and normalizes nutrition meal data
 */
function normalizeMeal(meal: any): NutritionMeal {
  return {
    name: meal.name?.trim() || 'Unknown Meal',
    calories: Math.max(0, Math.floor(Number(meal.calories) || 0)),
    protein: Math.max(0, Math.floor(Number(meal.protein) || 0)),
    carbs: Math.max(0, Math.floor(Number(meal.carbs) || 0)),
    fats: Math.max(0, Math.floor(Number(meal.fats) || 0)),
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.map((i: any) => String(i).trim()) : undefined,
    instructions: meal.instructions?.trim(),
    timing: meal.timing?.trim()
  };
}

/**
 * Sanitizes and normalizes nutrition day data
 */
function normalizeNutritionDay(day: any): NutritionDay {
  return {
    date: day.date?.trim(),
    totalCalories: Math.max(0, Math.floor(Number(day.totalCalories) || 0)),
    meals: (Array.isArray(day.meals) ? day.meals : []).map(normalizeMeal),
    waterIntake: day.waterIntake ? Math.max(0, Number(day.waterIntake)) : undefined,
    notes: day.notes?.trim()
  };
}

/**
 * Main function: Parse and validate AI response in one go
 */
function parseAndValidateAIResponse(response: string): {
  plan: FitnessPlan | null;
  validation: ValidationResult;
  normalized: FitnessPlan | null;
} {
  const { plan, errors: parseErrors, warnings: parseWarnings } = parseAIResponse(response);

  if (!plan) {
    return {
      plan: null,
      validation: {
        isValid: false,
        errors: parseErrors,
        warnings: parseWarnings
      },
      normalized: null
    };
  }

  const validation = validateParsedPlan(plan);

  // Normalize the plan even if validation fails (for partial recovery)
  const normalized: FitnessPlan = {
    goal: plan.goal?.trim() || 'Fitness Improvement',
    duration: Math.max(1, Math.floor(Number(plan.duration) || 1)),
    difficulty: (['beginner', 'intermediate', 'advanced'].includes(plan.difficulty) ? plan.difficulty : 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
    workoutPlan: Array.isArray(plan.workoutPlan) ? plan.workoutPlan.map(normalizeWorkoutDay) : [],
    nutritionPlan: Array.isArray(plan.nutritionPlan) ? plan.nutritionPlan.map(normalizeNutritionDay) : [],
    supplements: Array.isArray(plan.supplements) ? plan.supplements.map((s: any) => String(s).trim()) : undefined,
    progressMetrics: Array.isArray(plan.progressMetrics) ? plan.progressMetrics.map((m: any) => String(m).trim()) : undefined,
    warnings: [...validation.warnings, ...(Array.isArray(plan.warnings) ? plan.warnings.map((w: any) => String(w).trim()) : [])],
    startDate: plan.startDate?.trim()
  };

  return {
    plan,
    validation: {
      ...validation,
      warnings: [...validation.warnings, ...parseWarnings]
    },
    normalized
  };
}

/**
 * Utility function to get a summary of validation issues
 */
function getValidationSummary(validation: ValidationResult): string {
  const parts: string[] = [];

  if (validation.isValid) {
    parts.push('✓ Plan is valid');
  } else {
    parts.push('✗ Plan has errors:');
    validation.errors.forEach(error => parts.push(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    parts.push('⚠ Warnings:');
    validation.warnings.forEach(warning => parts.push(`  - ${warning}`));
  }

  return parts.join('\n');
}

// Export all functions and types
export {
  // Types
  WorkoutExercise,
  WorkoutDay,
  NutritionMeal,
  NutritionDay,
  FitnessPlan,
  ValidationResult,
  // Validation functions
  validateExercise,
  validateWorkoutDay,
  validateMeal,
  validateNutritionDay,
  validateFitnessPlan,
  validateParsedPlan,
  // Parsing functions
  parseAIResponse,
  parseAndValidateAIResponse,
  // Normalization functions
  normalizeExercise,
  normalizeWorkoutDay,
  normalizeMeal,
  normalizeNutritionDay,
  // Utility functions
  getValidationSummary
};
