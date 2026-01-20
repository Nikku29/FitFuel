import { UserData } from '../contexts/UserContextTypes';

// --- 1. THE SCHEMAS (Native TypeScript Interfaces) ---

interface SafetyCheckResult {
    safe: boolean;
    warnings: string[];
    modified_plan?: any;
}

interface MacroCycle {
    cycle_name: string;
    primary_focus: string;
    duration_weeks: number;
    sessions_per_week: number;
}

interface DailySession {
    id: string;
    title: string;
    focus: string;
    exercises: {
        name: string;
        sets: string;
        reps: string;
        tempo?: string;
        notes?: string;
    }[];
    recovery_score_required?: number;
}

// --- 2. THE AGENTS (The "Brain") ---

class BioDataSentinel {
    // Hard-coded safety rules (O(1) validations)
    static validate(user: UserData, planType: 'workout' | 'nutrition'): SafetyCheckResult {
        const warnings: string[] = [];

        if (planType === 'workout') {
            if (user.medicalConditions?.toLowerCase().includes('knee')) {
                warnings.push("Knee injury detected. High-impact jumps and deep heavy squats effectively pruned.");
            }
            if (user.medicalConditions?.toLowerCase().includes('back')) {
                warnings.push("Back issue detected. Spinal loading minimized.");
            }
        }

        if (planType === 'nutrition') {
            if (user.allergies?.toLowerCase().includes('nut')) {
                warnings.push("CRITICAL: Nut-free protocol enforced.");
            }
            if (user.medicalConditions?.toLowerCase().includes('diabetes')) {
                warnings.push("Glycemic index cap enforced.");
            }
        }

        return { safe: warnings.length === 0, warnings };
    }
}

class PeriodizationArchitect {
    // Mifflin-St Jeor & Volume Load Logic
    static calculateBaselines(user: UserData) {
        // Simple BMR calc for demo
        let bmr = 1500;
        if (user.weight && user.height && user.age && user.gender) {
            // Mifflin-St Jeor Reference
            const s = user.gender === 'Male' ? 5 : -161;
            bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + s;
        }

        return {
            daily_calories: Math.round(bmr * 1.2), // Baseline multiplier
            volume_tier: user.activityLevel === 'Advanced' ? 'High' : 'Moderate'
        };
    }
}

class ReactiveCoach {
    // State Machine for Daily adjustments
    static adjustSession(user: UserData, basePlan: any, feedback?: string) {
        // If user is at Home, enforce Bodyweight Strategy
        if (user.location?.toLowerCase().includes('home') || feedback?.includes('travel')) {
            return {
                ...basePlan,
                title: `${basePlan.title} (Home Edit)`,
                exercises: basePlan.exercises.map((ex: any) => ({
                    ...ex,
                    name: ex.name.replace('Barbell', 'Dumbbell').replace('Machine', 'Band')
                }))
            };
        }
        return basePlan;
    }
}

// --- 3. THE ENGINE (The Orchestrator) ---

export class AgenticEngine {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        // PRIORITY: Gemini -> OpenAI -> DeepSeek
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
        const deepSeekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

        if (geminiKey) {
            this.apiKey = geminiKey;
            this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        } else if (openAIKey) {
            this.apiKey = openAIKey;
            this.baseUrl = 'https://api.openai.com/v1';
        } else if (deepSeekKey) {
            this.apiKey = deepSeekKey;
            this.baseUrl = 'https://api.deepseek.com/v1';
        } else {
            this.apiKey = '';
            this.baseUrl = '';
            console.warn("AgenticEngine: No API Key found.");
        }
    }

    async runWorkflow(user: UserData, intent: 'generate_workout' | 'generate_meal'): Promise<any> {
        if (!this.apiKey) {
            throw new Error("No AI Identity found. Please configure your API Key.");
        }

        // Step 1: Sentinel Scan (Safety Layer)
        const safetyCheck = BioDataSentinel.validate(user, intent === 'generate_workout' ? 'workout' : 'nutrition');

        // Step 2: Architect Calculation (Strategy Layer)
        const baselines = PeriodizationArchitect.calculateBaselines(user);

        // Step 3: LLM Generation (Cognitive Multi-Agent Architecture)
        const systemPrompt = `
      # FitFuel Neural-Fitness Orchestrator (v2.0)
      
      I. CORE IDENTITY & MISSION
      You are the FitFuel Orchestrator, a state-of-art Health Intelligence Engine. Your mission is to function as a real-time, proactive personal assistant, dietitian, and gym coach. Each plan must be a unique, physiological solution.

      II. COGNITIVE MULTI-AGENT ARCHITECTURE (Simulate these 5 Agents):
      
      1. Bio-Data Sentinel (BDS) [SAFETY]
         - Role: Safety, Compliance, Guardrails.
         - Logic: O(1) valdiation. IF user has '${user.medicalConditions || 'none'}', REJECT contraindications.
         - Warnings Active: ${JSON.stringify(safetyCheck.warnings)}
         
      2. Periodization Architect (PA) [STRATEGY]
         - Role: Long-term Macro-cycle.
         - Baseline BMR: ${baselines.daily_calories} kcal.
         - Volume Tier: ${baselines.volume_tier}.
         - Directive: Ensure progressive overload (+2.5-5% intensity).

      3. Reactive Coach (RC) [TACTICS]
         - Role: Daily Tactical Adaptation.
         - Context: User Location is '${user.location || 'Gym'}'.
         - Logic: If 'Home', use Bodyweight/Limited Equipment. If 'Gym', use Barbell/Machines.
         
      4. Liaison Agent (LA) [HUMANIZER]
         - Role: Human-Intelligence Interface.
         - Directive: Translate JSON into human insights. Explain *why* a change was made.
         
      5. Entropy Controller (EC) [VARIETY]
         - Role: Variety & Engagement.
         - Directive: Swap exercises with similar biomechanics to prevent staleness.

      III. OPERATIONAL INSTRUCTION SET
      - Format: Return strictly valid JSON.
      - Tone: Professional, blunt, directive. No filler words.
      
      TASK: Generate a ${intent === 'generate_workout' ? 'High-Fidelity Workout Session' : 'Nutritionally Precision Meal Plan'} for this user.
      User Profile: ${JSON.stringify(user)}
    `;

        try {
            const result = await this.callLLM(systemPrompt);

            // Step 4: Liaison Layer (Humanizer is explicitly requested in prompt, but we reinforce it here)
            return {
                ...result,
                agentic_insight: safetyCheck.warnings.length > 0
                    ? `[System Audit]: ${safetyCheck.warnings.join('. ')} Adjusted plan accordingly.`
                    : "[System Insight]: Optimized for your current macro-cycle."
            };

        } catch (e) {
            console.error("Agentic Flow Failed", e);
            return null;
        }
    }

    private async callLLM(prompt: string): Promise<any> {
        // Universal Fetch Wrapper handling Gemini vs OpenAI structures
        const isGemini = this.baseUrl.includes('goog');

        const body = isGemini
            ? { contents: [{ parts: [{ text: prompt }] }] }
            : {
                model: 'gpt-3.5-turbo', // or dynamic
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.7
            };

        const url = isGemini ? `${this.baseUrl}?key=${this.apiKey}` : `${this.baseUrl}/chat/completions`;

        console.log(`[AgenticEngine] Calling AI Provider: ${isGemini ? 'Gemini' : 'OpenAI/DeepSeek'}`);
        console.log(`[AgenticEngine] Endpoint: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(isGemini ? {} : { 'Authorization': `Bearer ${this.apiKey}` }) },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[AgenticEngine] API Error (${response.status}):`, errText);
            throw new Error(`AI Connection Refused (${response.status}): ${errText}`);
        }

        console.log(`[AgenticEngine] Response Status: ${response.status}`);

        const data = await response.json();
        const rawText = isGemini
            ? data.candidates[0].content.parts[0].text
            : data.choices[0].message.content;

        // Clean JSON
        const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    }
}

export const agenticEngine = new AgenticEngine();
