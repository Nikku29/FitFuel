import { UserData } from '../contexts/UserContextTypes';
import { SafetySanitizer } from './SafetySanitizer';
import {
  AI_CONFIG,
  OPENROUTER_BASE,
  MODEL_LOGIC_PLANNER,
  MODEL_CREATIVE_ARCHITECT,
  MODEL_FAST_CHAT,
  OPENROUTER_HEADERS,
} from '@/config/aiConfig';
import { db } from '@/integrations/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export type WorkflowIntent = 'generate_workout' | 'generate_meal' | 'update_dashboard' | 'chat';

// --- 1. THE EXPERTS (The MoE Layer) ---

class TrainerExpert {
  static getSystemPrompt(user: UserData, progressData?: any, mode: 'single' | 'weekly' = 'single'): string {
    const userContext = this.buildUserContext(user, progressData);

    if (mode === 'weekly') {
      return `
    ROLE: Elite Strength & Conditioning Coach & Periodization Specialist.
    MISSION: Create a comprehensive 7-day weekly workout plan that adapts to user progress and ensures progressive overload.
    
    USER PROFILE:
    ${userContext}
    
    PROGRESSIVE ADAPTATION LOGIC:
    1. If user has completed ${progressData?.workoutsCompleted || 0} workouts, they are ${progressData?.weeksActive ? `${progressData.weeksActive} weeks` : 'new'} into their journey.
    2. ${progressData?.weeksActive && progressData.weeksActive > 2 ? 'User has been active for multiple weeks. INCREASE intensity/volume by 10-15% from baseline.' : 'User is starting out. Use conservative baseline volume.'}
    3. ${progressData?.lastWorkoutDifficulty ? `Last workout difficulty was ${progressData.lastWorkoutDifficulty}. Progress accordingly.` : 'No previous workout data. Start at baseline.'}
    4. ${progressData?.strengthImprovements ? `User has shown strength improvements: ${JSON.stringify(progressData.strengthImprovements)}. Increase weights/reps accordingly.` : ''}
    
    WEEKLY PLAN REQUIREMENTS:
    1. Create 7 days (Monday through Sunday)
    2. Include 1-2 rest days strategically placed
    3. Vary muscle groups to prevent overtraining
    4. Progressive overload: Each week should be slightly more challenging
    5. Include warm-up and cool-down suggestions
    
    EXERCISE SPECIFICATIONS (PER DAY):
    - Name: Clear exercise name
    - Sets: Number as string (minimum 3, maximum 5)
    - Reps: Specific rep range (e.g., "8-10", "12-15", "AMRAP")
    - Rest_seconds: Calculated rest time (30-240s based on exercise type and user level)
    - Suggested_weight: Percentage of bodyweight or specific weight
    - Description: Form cues and technique tips
    - Equipment: Array of required equipment
    
    REQUIRED JSON OUTPUT (ARRAY OF 7 DAYS):
    [
      {
        "day": "Monday",
        "focus": "Upper Body Strength",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": "4",
            "reps": "8-10",
            "rest_seconds": 120,
            "suggested_weight": "70% of 1RM or 50% BW",
            "description": "Lower bar to chest, press up explosively",
            "equipment": ["Barbell", "Bench"]
          }
        ],
        "total_duration": "45-60 min",
        "calories_estimate": 350
      },
      ... (6 more days)
    ]
    
    ADAPTIVE LOGIC:
    - Week 1-2: Foundation building, form focus
    - Week 3-4: Increase volume by 10%
    - Week 5+: Introduce advanced techniques, increase intensity
    - Always consider user's current level and adjust accordingly`;
    }

    return `
    ROLE: Elite Strength & Conditioning Coach.
    MISSION: Construct a high-fidelity workout session based on physiological principles.
    
    USER PROFILE:
    ${userContext}
    
    ${progressData ? `PROGRESS CONTEXT: User has completed ${progressData.workoutsCompleted || 0} workouts. ${progressData.weeksActive ? `Active for ${progressData.weeksActive} weeks.` : ''} ${progressData.lastWorkoutDifficulty ? `Last session: ${progressData.lastWorkoutDifficulty} difficulty.` : ''}` : ''}
    
    DYNAMIC PHYSIOLOGICAL LOGIC (ADAPTIVE MODE):
    1. VOLUME: 
       - Beginner: 3 Sets/exercise. 
       - Intermediate: 4 Sets.
       - Advanced: 5 Sets.
       ${progressData?.weeksActive && progressData.weeksActive > 2 ? '- User has progressed: Consider 4-5 sets for intermediate level.' : ''}
    2. REST PERIODS (CRITICAL): 
       - DO NOT use flat defaults. CALCULATE based on user context.
       - IF User=Beginner AND Exercise=Compound -> HIGH REST (120s+).
       - IF Goal=Endurance OR Exercise=Isolation -> LOW REST (30-45s).
       - IF AI suggests "120s" for Squats, output 120. Do NOT default to 60.
    3. DURATION STRICTNESS:
       - Output duration PER SET. 
       - MAX duration for Core/Isometric is '60s'.
    4. REALISM:
       - No more than 3-4 sets/exercise for general fitness.
    5. LOAD CALCULATION:
       - Suggest weight as % of Bodyweight (BW) or specific KG if known.
       - e.g., "Squat: 50% BW"
       ${progressData?.strengthImprovements ? `- User has improved: Increase suggested weights by 5-10% from baseline.` : ''}
    6. NO LAZINESS:
       - NEVER output "1 Set". Minimum is 3.
    7. PROGRESSIVE OVERLOAD:
       ${progressData?.lastWorkoutDifficulty ? `- Last workout was ${progressData.lastWorkoutDifficulty}. This session should be ${progressData.lastWorkoutDifficulty === 'Beginner' ? 'slightly more challenging' : 'maintained or slightly progressed'}.` : '- This is a baseline session. Set appropriate starting point.'}
    
    REQUIRED JSON OUTPUT:
    {
      "title": "String",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "String",
      "calories": Number,
      "exercises": [
        { 
           "name": "String", 
           "sets": "String (Int)", 
           "reps": "String", 
           "rest_seconds": Number,
           "suggested_weight": "String",
           "description": "String",
           "equipment": ["String"]
        }
      ],
      "agentic_insight": "String (Rationale)"
    }`;
  }

  private static buildUserContext(user: UserData, progressData?: any): string {
    let context = `Level: ${user.activityLevel || 'Not specified'}\n`;
    context += `Goal: ${Array.isArray(user.fitnessGoal) ? user.fitnessGoal.join(', ') : user.fitnessGoal || 'Not specified'}\n`;
    context += `Age: ${user.age || 'Not specified'}\n`;
    context += `Gender: ${user.gender || 'Not specified'}\n`;
    context += `Weight: ${user.weight || 'Not specified'}kg\n`;
    context += `Height: ${user.height || 'Not specified'}cm\n`;
    if (user.bodyType) context += `Body Type: ${user.bodyType}\n`;
    if (user.activityRestrictions) context += `Restrictions: ${user.activityRestrictions}\n`;
    if (user.medicalConditions) context += `Medical Conditions: ${user.medicalConditions}\n`;
    
    // Add current day context to help the AI suggest appropriate workouts (e.g. Sunday rest days)
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    context += `CURRENT DAY OF WEEK: ${currentDay}\n`;
    context += `RULE: If today is Sunday (or a typical rest day) AND user asks for a workout, automatically suggest an Active Recovery session, stretching, or a light Home Workout unless the user specifically asks for heavy lifting.\n`;

    if (progressData) {
      context += `\nPROGRESS DATA:\n`;
      context += `- Workouts Completed: ${progressData.workoutsCompleted || 0}\n`;
      context += `- Weeks Active: ${progressData.weeksActive || 0}\n`;
      if (progressData.lastWorkoutDate) context += `- Last Workout: ${progressData.lastWorkoutDate}\n`;
      if (progressData.averageCaloriesBurned) context += `- Avg Calories/Workout: ${progressData.averageCaloriesBurned}\n`;
    }

    return context;
  }
}

class DietitianExpert {
  static getSystemPrompt(user: UserData, progressData?: any, mode: 'single' | 'weekly' = 'single'): string {
    const userContext = this.buildUserContext(user, progressData);

    if (mode === 'weekly') {
      return `
    ROLE: Clinical Dietitian & Meal Planning Specialist.
    MISSION: Create a comprehensive 7-day meal plan that adapts to user progress and fitness goals.
    
    USER PROFILE:
    ${userContext}
    
    PROGRESSIVE NUTRITION LOGIC:
    1. ${progressData?.weeksActive && progressData.weeksActive > 2 ? 'User has been active for multiple weeks. Consider increasing protein intake by 10-15% to support muscle recovery and growth.' : 'User is starting. Provide balanced baseline nutrition.'}
    2. ${progressData?.weightChange ? `User's weight has ${progressData.weightChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(progressData.weightChange)}kg. Adjust caloric intake accordingly.` : 'No weight change data. Use goal-based calculations.'}
    3. ${progressData?.workoutsCompleted && progressData.workoutsCompleted > 10 ? 'User is highly active. Increase post-workout nutrition and recovery meals.' : ''}
    
    WEEKLY MEAL PLAN REQUIREMENTS:
    1. Create 7 days of meals (breakfast, lunch, dinner, snacks)
    2. Ensure daily caloric target matches fitness goal
    3. Vary meals to prevent boredom and ensure nutrient diversity
    4. Include meal prep tips for efficiency
    5. Account for workout days vs rest days (higher calories on workout days)
    
    MEAL SPECIFICATIONS:
    - Title: Descriptive meal name
    - Category: breakfast/lunch/dinner/snack
    - Calories: Exact number
    - PrepTime: Realistic preparation time
    - Ingredients: Exact quantities (grams/cups, NO "handfuls")
    - Steps: Clear cooking instructions
    - NutritionFacts: Protein, carbs, fat, fiber (in grams)
    - DietaryType: Must match user preference
    - Tags: Relevant tags (high-protein, quick, etc.)
    
    REQUIRED JSON OUTPUT (ARRAY OF 7 DAYS):
    [
      {
        "day": "Monday",
        "meals": {
          "breakfast": {
            "title": "High Protein Oatmeal",
            "calories": 450,
            "prepTime": "10 mins",
            "ingredients": ["80g rolled oats", "200ml almond milk", "30g protein powder", "1 banana"],
            "steps": ["Cook oats in milk", "Mix in protein powder", "Top with banana"],
            "nutritionFacts": { "protein": 35, "carbs": 55, "fat": 8, "fiber": 6 },
            "dietaryType": "${user.dietaryPreference?.toLowerCase() || 'vegetarian'}",
            "tags": ["high-protein", "quick"]
          },
          "lunch": { ... },
          "dinner": { ... },
          "snacks": [ ... ]
        },
        "total_calories": 2000,
        "total_protein": 150,
        "meal_prep_tips": "Prep overnight oats and lunch containers on Sunday"
      },
      ... (6 more days)
    ]
    
    ADAPTIVE LOGIC:
    - Week 1-2: Establish baseline nutrition patterns
    - Week 3-4: Optimize macros based on progress
    - Week 5+: Fine-tune for peak performance`;
    }

    return `
    ROLE: Clinical Dietitian.
    MISSION: Create a single recipe/meal from the user's NLP request. Respect user profile and goals.
    
    USER PROFILE:
    ${userContext}
    
    ${progressData ? `PROGRESS: ${progressData.weeksActive || 0} weeks active. ${progressData.avgCaloriesConsumedPerDay ? `Avg ${progressData.avgCaloriesConsumedPerDay} kcal/day consumed.` : ''} ${progressData.caloriesConsumedThisWeek ? `This week: ${progressData.caloriesConsumedThisWeek} kcal.` : ''}` : ''}
    
    NLP INTERPRETATION:
    - "Feeling tired" / "need energy" → suggest energizing drinks or light meals (e.g. smoothie, banana oats, chai).
    - Specific dish (e.g. "Poha", "Oats", "Grilled chicken") → provide that recipe.
    - "High protein", "low carb", etc. → fit recipe to the constraint.
    
    RULES:
    1. Ingredients: exact quantities (grams, cups, tablespoons). No "handful" or "to taste" alone.
    2. Steps: clear, ordered cooking instructions.
    3. Nutrition: always provide per serving. State "servingSize" (e.g. "1 cup", "250ml", "1 bowl").
    4. nutritionFacts: protein, carbs, fat, fiber in grams per serving. Calories per serving.
    5. dietaryType must match user preference (e.g. veg, vegan, non-veg).
    
    REQUIRED JSON OUTPUT:
    {
      "title": "String",
      "calories": Number,
      "prepTime": "String",
      "servingSize": "String (e.g. 1 cup / 1 bowl / 250g)",
      "ingredients": ["String with quantities"],
      "steps": ["String"],
      "nutritionFacts": { "protein": Number, "carbs": Number, "fat": Number, "fiber": Number },
      "dietaryType": "String",
      "tags": ["String"],
      "agentic_insight": "String"
    }`;
  }

  private static buildUserContext(user: UserData, progressData?: any): string {
    let context = `Dietary Preference: ${user.dietaryPreference || 'Not specified'}\n`;
    context += `Fitness Goal: ${Array.isArray(user.fitnessGoal) ? user.fitnessGoal.join(', ') : user.fitnessGoal || 'Not specified'}\n`;
    context += `Age: ${user.age || 'Not specified'}\n`;
    context += `Gender: ${user.gender || 'Not specified'}\n`;
    context += `Weight: ${user.weight || 'Not specified'}kg\n`;
    context += `Height: ${user.height || 'Not specified'}cm\n`;
    if (user.allergies) context += `Allergies: ${user.allergies}\n`;
    if (user.medicalConditions) context += `Medical Conditions: ${user.medicalConditions}\n`;
    if (user.activityLevel) context += `Activity Level: ${user.activityLevel}\n`;

    // Add current day context to help the AI suggest appropriate meals (e.g. Sunday large family meals or prep day)
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    context += `CURRENT DAY OF WEEK: ${currentDay}\n`;
    context += `RULE: If today is Sunday, automatically suggest meal-prep friendly recipes or slightly more indulgent/relaxed weekend meals unless the user specifies otherwise.\n`;

    if (progressData) {
      context += `\nPROGRESS DATA:\n`;
      context += `- Weeks Active: ${progressData.weeksActive || 0}\n`;
      if (progressData.weightChange) context += `- Weight Change: ${progressData.weightChange > 0 ? '+' : ''}${progressData.weightChange}kg\n`;
      if (progressData.workoutsCompleted) context += `- Workouts Completed: ${progressData.workoutsCompleted}\n`;
    }

    return context;
  }
}

class DashboardExpert {
  static getSystemPrompt(): string {
    return `You are a UI/UX logic engine. You take User Data (Activity, Goal) and output a JSON structure that dictates the "Dashboard" state: Calories Burned target, Macro split, Suggested Meal Cards, plus brief insight text for the user.

REQUIRED JSON OUTPUT:
{
  "caloriesBurnedTarget": Number,
  "macroSplit": { "protein": Number, "carbs": Number, "fat": Number },
  "suggestedMealCards": [
    { "title": "String", "calories": Number, "category": "breakfast|lunch|dinner|snack" }
  ],
  "personalizedTip": "String",
  "recommendedAction": "String",
  "progressAnalysis": "String",
  "motivationalMessage": "String"
}

Return ONLY valid JSON. No markdown, no explanations.`;
  }
}

// --- 2. ROUTER + OPENROUTER CLIENT ---

function getModelForIntent(intent: WorkflowIntent): string {
  switch (intent) {
    case 'generate_workout':
      return AI_CONFIG.MODELS.LOGIC;
    case 'generate_meal':
    case 'update_dashboard':
      return AI_CONFIG.MODELS.CREATIVE;
    case 'chat':
      return AI_CONFIG.MODELS.CHAT;
    default:
      return AI_CONFIG.MODELS.CHAT;
  }
}

const SAFE_WORKOUT_JSON = {
  title: 'Safe Mode Session',
  difficulty: 'Beginner',
  duration: '20 min',
  calories: 80,
  exercises: [
    { name: 'March in Place', sets: '3', reps: '30', rest_seconds: 45, suggested_weight: 'Bodyweight', description: 'March steadily, knees up.', equipment: [] },
    { name: 'Air Squats', sets: '3', reps: '10', rest_seconds: 60, suggested_weight: 'Bodyweight', description: 'Feet shoulder-width, lower with control.', equipment: [] },
  ],
  agentic_insight: 'Fallback plan due to API unavailability.',
};

const SAFE_MEAL_JSON = {
  title: 'Simple Balanced Meal',
  calories: 450,
  prepTime: '10 mins',
  servingSize: '1 plate',
  ingredients: ['100g rice', '50g dal', '100g vegetables'],
  steps: ['Cook rice and dal.', 'Steam vegetables.', 'Serve together.'],
  nutritionFacts: { protein: 15, carbs: 60, fat: 8, fiber: 4 },
  dietaryType: 'vegetarian',
  tags: ['quick', 'balanced'],
  agentic_insight: 'Fallback meal due to API unavailability.',
};

const SAFE_DASHBOARD_JSON = {
  caloriesBurnedTarget: 300,
  macroSplit: { protein: 30, carbs: 45, fat: 25 },
  suggestedMealCards: [
    { title: 'Oatmeal with fruit', calories: 350, category: 'breakfast' },
    { title: 'Grilled chicken salad', calories: 450, category: 'lunch' },
  ],
};

export class AgenticEngine {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.apiKey = key || '';
    this.baseUrl = AI_CONFIG.BASE_URL;
  }

  async runWorkflow(
    user: UserData,
    intent: WorkflowIntent,
    options?: {
      mode?: 'single' | 'weekly';
      progressData?: any;
      customPrompt?: string;
      chatMessages?: { role: 'user' | 'assistant'; content: string }[];
    }
  ): Promise<any> {
    if (!this.apiKey) throw new Error('AI Identity Missing (No OpenRouter API Key). Set VITE_OPENROUTER_API_KEY.');

    const mode = options?.mode || 'single';
    const progressData = options?.progressData;
    const modelId = getModelForIntent(intent);

    let systemPrompt: string;
    let userPrompt: string;

    if (intent === 'chat') {
      systemPrompt = 'You are FitFuel AI, a supportive fitness and nutrition assistant. Be concise, helpful, and evidence-based.';
      const lastUser = options?.chatMessages?.filter((m) => m.role === 'user').pop();
      userPrompt = (lastUser?.content as string) || 'Hello';
    } else if (intent === 'update_dashboard') {
      systemPrompt = DashboardExpert.getSystemPrompt();
      const prog = options?.progressData;
      userPrompt = `User Data: Activity=${user.activityLevel}, Goal=${user.fitnessGoal}. ${prog ? `Stats: workouts=${prog.workoutsCompleted ?? 0}, weeksActive=${prog.weeksActive ?? 0}, caloriesThisWeek=${prog.caloriesConsumedThisWeek ?? 0}.` : ''} Output dashboard JSON.`;
    } else {
      systemPrompt =
        intent === 'generate_workout'
          ? TrainerExpert.getSystemPrompt(user, progressData, mode)
          : DietitianExpert.getSystemPrompt(user, progressData, mode);

      if (options?.customPrompt) {
        userPrompt = options.customPrompt;
      } else if (mode === 'weekly') {
        userPrompt =
          intent === 'generate_workout'
            ? 'Generate a complete 7-day weekly workout plan. Include all days Monday through Sunday with appropriate rest days.'
            : 'Generate a complete 7-day weekly meal plan. Include breakfast, lunch, dinner, and snacks for each day.';
      } else {
        userPrompt =
          intent === 'generate_workout'
            ? 'Generate a single workout session with detailed exercises, sets, reps, rest times, and weights.'
            : 'Generate a single meal/recipe with complete nutritional information and cooking instructions.';
      }
    }

    const userMessage =
      intent === 'chat'
        ? userPrompt
        : `USER REQUEST: ${userPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON structure.`;

    console.log(`[AgenticEngine] Intent=${intent} Model=${modelId} (${mode})`);

    try {
      const raw = await this.callLLM(
        intent === 'chat' ? '' : systemPrompt,
        intent === 'chat' ? userPrompt : userMessage,
        modelId,
        intent === 'chat',
        intent === 'chat' ? options?.chatMessages : undefined
      );

      if (intent === 'chat') return raw as string;

      const rawPlan = typeof raw === 'string' ? this.parseJSON(raw) : (raw as any);

      if (intent === 'generate_workout') {
        if (mode === 'weekly' && Array.isArray(rawPlan)) {
          return rawPlan.map((day: any) => {
            if (day?.exercises) {
              return { ...day, exercises: SafetySanitizer.sanitizeSession({ exercises: day.exercises }).exercises };
            }
            return day;
          });
        }
        return SafetySanitizer.sanitizeSession(rawPlan);
      }

      if (intent === 'update_dashboard') {
        // CRITICAL: Save to Firestore immediately after generation
        // The ProfileStats component will also write, but this ensures consistency
        // We'll write here if user context is available, otherwise ProfileStats handles it
        return rawPlan;
      }

      return rawPlan;
    } catch (e) {
      console.error('Expert Agent Failed:', e);
      if (intent === 'generate_workout') {
        if (mode === 'weekly') {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          return days.map((day, i) => ({
            day,
            focus: i % 3 === 0 ? 'Rest & Recovery' : 'Full Body',
            exercises: SAFE_WORKOUT_JSON.exercises,
            total_duration: '20 min',
            calories_estimate: 80,
          }));
        }
        return SAFE_WORKOUT_JSON;
      }
      if (intent === 'generate_meal') return SAFE_MEAL_JSON;
      if (intent === 'update_dashboard') return SAFE_DASHBOARD_JSON;
      throw e;
    }
  }

  private parseJSON(rawText: string): any {
    let s = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = s.indexOf('[') >= 0 ? s.indexOf('[') : s.indexOf('{');
    const end = s.lastIndexOf(']') >= 0 ? s.lastIndexOf(']') + 1 : s.lastIndexOf('}') + 1;
    if (start >= 0 && end > start) s = s.slice(start, end);
    return JSON.parse(s);
  }

  async callLLM(
    systemPrompt: string,
    userPrompt: string,
    modelId: string,
    isChat = false,
    chatMessages?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string | any> {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = AI_CONFIG.HEADERS(this.apiKey);

    type Msg = { role: 'system' | 'user' | 'assistant'; content: string };
    const messages: Msg[] = [];

    if (isChat && chatMessages && chatMessages.length > 0) {
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      chatMessages.forEach((m) => {
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        messages.push({ role, content: m.content });
      });
    } else {
      if (!isChat && systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userPrompt });
    }

    const body = {
      model: modelId,
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    };

    const doRequest = async (model: string) => {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, model }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${text}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (data.error?.message) throw new Error(data.error.message);
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) throw new Error('Empty response from OpenRouter.');
      return content;
    };

    try {
      return await doRequest(modelId);
    } catch (err: any) {
      const is5xx = /^OpenRouter 5\d\d/.test(err?.message || '');
      const is429 = /429|rate|quota/i.test(err?.message || '');

      if (is5xx || is429) {
        console.warn(`[AgenticEngine] Primary model failed (${modelId}), falling back to ${AI_CONFIG.MODELS.CHAT}`);
        try {
          return await doRequest(AI_CONFIG.MODELS.CHAT);
        } catch (fallbackErr) {
          console.error('[AgenticEngine] Fallback model also failed:', fallbackErr);
          throw fallbackErr;
        }
      }
      throw err;
    }
  }
}

export const agenticEngine = new AgenticEngine();
