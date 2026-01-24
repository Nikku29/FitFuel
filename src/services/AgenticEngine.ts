import { UserData } from '../contexts/UserContextTypes';
import { SafetySanitizer } from './SafetySanitizer';

// --- 1. THE EXPERTS (The MoE Layer) ---

class TrainerExpert {
    static getSystemPrompt(user: UserData): string {
        return `
    ROLE: Elite Strength & Conditioning Coach.
    MISSION: Construct a high-fidelity workout session based on physiological principles.
    USER: Level=${user.activityLevel}, Goal=${Array.isArray(user.fitnessGoal) ? user.fitnessGoal.join(',') : user.fitnessGoal}, Biometrics=[${user.weight}kg, ${user.height}cm].
    
    STRICT PHYSIOLOGICAL RULES:
    1. VOLUME MATH: 
       - Beginner: 3 Sets/exercise. 
       - Intermediate: 4 Sets.
       - Advanced: 5 Sets.
    2. REST LOGIC: 
       - Output 'rest_seconds' explicitly. 
       - Standard: 60s. Compounds: 90s.
    3. LOAD CALCULATION:
       - Suggest weight as % of Bodyweight (BW) or specific KG if known.
       - e.g., "Squat: 50% BW"
    4. NO LAZINESS:
       - NEVER output "1 Set". Minimum is 3.
    
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
           "description": "String" 
        }
      ],
      "agentic_insight": "String (Rationale)"
    }`;
    }
}

class DietitianExpert {
    static getSystemPrompt(user: UserData): string {
        return `
    ROLE: Clinical Dietitian.
    MISSION: Construct a precision meal plan.
    USER: Diet=${user.dietaryPreference}, Allergies=${user.allergies}, Goal=${Array.isArray(user.fitnessGoal) ? user.fitnessGoal.join(',') : user.fitnessGoal}.
    
    STRICT NUTRITIONAL RULES:
    1. MACRO MATH:
       - Ensure Caloric Balance matches goal (Deficit for Weight Loss, Surplus for Muscle).
    2. PORTION CONTROL:
       - Output exact grams/cups. "Handful" is forbidden.
    3. SEARCH SIMULATION:
       - If user requests generic food, provide standard nutritional data.
    
    REQUIRED JSON OUTPUT:
    {
      "title": "String",
      "calories": Number,
      "prepTime": "String",
      "ingredients": ["String"],
      "steps": ["String"],
      "nutritionFacts": { "protein": Number, "carbs": Number, "fat": Number },
      "agentic_insight": "String"
    }`;
    }
}

// --- 2. THE ROUTER (The Orchestrator) ---

export class AgenticEngine {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (geminiKey) {
            this.apiKey = geminiKey;
            this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        } else if (openAIKey) {
            this.apiKey = openAIKey;
            this.baseUrl = 'https://api.openai.com/v1';
        } else {
            this.apiKey = '';
            this.baseUrl = '';
        }
    }

    async runWorkflow(user: UserData, intent: 'generate_workout' | 'generate_meal'): Promise<any> {
        if (!this.apiKey) throw new Error("AI Identity Missing (No API Key).");

        // 1. Router Logic: Select Expert
        const systemPrompt = intent === 'generate_workout'
            ? TrainerExpert.getSystemPrompt(user)
            : DietitianExpert.getSystemPrompt(user);

        console.log(`[AgenticEngine] Routing to ${intent === 'generate_workout' ? 'Trainer' : 'Dietitian'} Expert...`);

        // 2. Expert Generation
        try {
            const rawPlan = await this.callLLM(systemPrompt);

            // 3. Logic Firewall (Sanitization)
            // Even Experts make mistakes. Verify with local math.
            if (intent === 'generate_workout') {
                return SafetySanitizer.sanitizeSession(rawPlan);
            }

            return rawPlan;
        } catch (e) {
            console.error("Expert Agent Failed:", e);
            throw e;
        }
    }

    private async callLLM(prompt: string): Promise<any> {
        const isGemini = this.baseUrl.includes('goog');
        const body = isGemini
            ? { contents: [{ parts: [{ text: prompt }] }] }
            : {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.7
            };

        const url = isGemini ? `${this.baseUrl}?key=${this.apiKey}` : `${this.baseUrl}/chat/completions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(isGemini ? {} : { 'Authorization': `Bearer ${this.apiKey}` }) },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`AI API Error: ${response.status}`);

        const data = await response.json();
        const rawText = isGemini
            ? data.candidates?.[0]?.content?.parts?.[0]?.text
            : data.choices?.[0]?.message?.content;

        if (!rawText) throw new Error("Empty response from AI Provider.");

        const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    }
}

export const agenticEngine = new AgenticEngine();
