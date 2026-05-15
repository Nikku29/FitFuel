/**
 * FitFuel - MoE (Mixture of Experts) Orchestration System
 * Pure OpenRouter Free Models Architecture
 *
 * Agent Roles:
 * - REASONING: Orchestrates workflow, decides next agent
 * - LOGIC: Math calculations, workout planning
 * - VISION: Visual analysis, portion estimation
 * - STRUCTURING: JSON formatting for database
 */

import { AI_CONFIG } from '@/config/aiConfig';

export interface MoEAgent {
  id: string;
  model: string;
  systemPrompt: string;
  tools?: any[];
  maxRetries: number;
  timeout: number;
}

export interface MoEWorkflow {
  id: string;
  agents: MoEAgent[];
  maxIterations: number;
  memory: Record<string, any>;
}

export interface MoEResponse {
  agent: string;
  output: any;
  confidence: number;
  nextAgent?: string;
  error?: string;
}

class MoEOrchestrator {
  private apiKey: string;
  private workflows: Map<string, MoEWorkflow> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('VITE_OPENROUTER_API_KEY required for MoE system');
    }
  }

  // Agent Definitions
  private agents: Record<string, MoEAgent> = {
    reasoning: {
      id: 'reasoning',
      model: AI_CONFIG.MODELS.REASONING,
      systemPrompt: `You are the Brain (Reasoning Agent) for FitFuel nutrition app.
Your role: Analyze user requests and orchestrate the workflow by deciding which specialized agent to call next.

Available agents:
- logic: For mathematical calculations (calories, macros, workout progress)
- vision: For food image analysis and portion estimation
- structuring: For converting results into database-ready JSON

Response format: JSON with "next_agent" and "context" fields.
Example: {"next_agent": "logic", "context": "calculate daily calorie needs"}

Keep responses focused - avoid task creep.`,
      maxRetries: 3,
      timeout: 30000
    },

    logic: {
      id: 'logic',
      model: AI_CONFIG.MODELS.LOGIC,
      systemPrompt: `You are the Analyst (Logic Agent) for FitFuel.
Your role: Perform precise mathematical calculations for fitness and nutrition.

Capabilities:
- Caloric deficit/surplus calculations
- Macro-nutrient splits (protein/carbs/fats)
- Progressive overload percentages
- BMI, BMR, TDEE calculations
- Workout volume and intensity metrics

Always show your work and provide numerical results with units.`,
      maxRetries: 2,
      timeout: 20000
    },

    vision: {
      id: 'vision',
      model: AI_CONFIG.MODELS.VISION,
      systemPrompt: `You are the Visionary (Vision Agent) for FitFuel.
Your role: Analyze food images and estimate portions with spatial grounding.

For each food item, provide:
- Exact location on plate (coordinates if possible)
- Portion size estimation (grams/ounces)
- Visual characteristics (color, texture, preparation)

Focus on accuracy for nutritional analysis.`,
      maxRetries: 2,
      timeout: 25000
    },

    structuring: {
      id: 'structuring',
      model: AI_CONFIG.MODELS.STRUCTURING,
      systemPrompt: `You are the Architect (Structuring Agent) for FitFuel.
Your role: Convert raw agent outputs into clean JSON for Supabase database insertion.

Required output format: Valid JSON only, no markdown or explanations.
Ensure all required fields are present and properly typed.

Database schemas:
- nutrition_logs: {food_name, calories, macros, meal_type, date}
- workout_logs: {workout_title, duration, calories_burned, exercises}
- user_progress: {date, weight, measurements, goals}`,
      maxRetries: 3,
      timeout: 15000
    }
  };

  // Core API Call Method with Retry Logic
  private async callAgent(
    agent: MoEAgent,
    userPrompt: string,
    context?: Record<string, any>
  ): Promise<MoEResponse> {
    const headers = AI_CONFIG.HEADERS(this.apiKey);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= agent.maxRetries; attempt++) {
      try {
        const payload = {
          model: agent.model,
          messages: [
            { role: 'system', content: agent.systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1, // Low temperature for consistency
          max_tokens: 2000,
          ...(agent.tools && { tools: agent.tools })
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), agent.timeout);

        const response = await fetch(AI_CONFIG.BASE_URL + '/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit - exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response from agent');
        }

        return {
          agent: agent.id,
          output: content,
          confidence: 0.9, // Could be enhanced with confidence scoring
          error: undefined
        };

      } catch (error) {
        lastError = error as Error;

        if (attempt === agent.maxRetries) {
          return {
            agent: agent.id,
            output: null,
            confidence: 0,
            error: `Agent ${agent.id} failed after ${agent.maxRetries} attempts: ${lastError.message}`
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      agent: agent.id,
      output: null,
      confidence: 0,
      error: lastError?.message || 'Unknown error'
    };
  }

  // Workflow Execution with State Management
  async executeWorkflow(
    workflowId: string,
    initialPrompt: string,
    maxIterations: number = 5
  ): Promise<MoEResponse[]> {
    const workflow: MoEWorkflow = {
      id: workflowId,
      agents: Object.values(this.agents),
      maxIterations,
      memory: {}
    };

    this.workflows.set(workflowId, workflow);

    const results: MoEResponse[] = [];
    let currentAgent = 'reasoning';
    let iteration = 0;

    while (iteration < maxIterations && currentAgent) {
      iteration++;

      const agent = this.agents[currentAgent];
      if (!agent) break;

      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(initialPrompt, workflow.memory);

      const result = await this.callAgent(agent, contextPrompt);
      results.push(result);

      // Update workflow memory
      workflow.memory[currentAgent] = result.output;

      // Determine next agent (for reasoning agent, parse JSON response)
      if (currentAgent === 'reasoning' && result.output) {
        try {
          const parsed = JSON.parse(result.output);
          currentAgent = parsed.next_agent;
          workflow.memory.context = parsed.context;
        } catch (e) {
          // Fallback to logic agent if JSON parsing fails
          currentAgent = 'logic';
        }
      } else {
        // Simple agent chain: reasoning -> logic/vision -> structuring
        currentAgent = currentAgent === 'reasoning' ? 'logic' : 'structuring';
      }

      // Prevent infinite loops
      if (results.length > 10) break;
    }

    return results;
  }

  // Build context-aware prompts
  private buildContextPrompt(initialPrompt: string, memory: Record<string, any>): string {
    let prompt = initialPrompt;

    if (memory.reasoning) {
      prompt += `\n\nReasoning context: ${memory.reasoning}`;
    }

    if (memory.logic) {
      prompt += `\n\nPrevious calculations: ${memory.logic}`;
    }

    if (memory.vision) {
      prompt += `\n\nVisual analysis: ${memory.vision}`;
    }

    return prompt;
  }

  // Schema validation for structuring agent output
  validateStructuredOutput(output: string, schema: string): boolean {
    try {
      const parsed = JSON.parse(output);

      // Basic validation - could be enhanced with JSON schema validation
      switch (schema) {
        case 'nutrition_log':
          return parsed.food_name && typeof parsed.calories === 'number';
        case 'workout_log':
          return parsed.workout_title && parsed.exercises;
        case 'user_progress':
          return parsed.date && parsed.weight;
        default:
          return true;
      }
    } catch {
      return false;
    }
  }

  // Rate limit monitoring
  getRateLimitStatus(): Promise<{ remaining: number; reset: Date } | null> {
    // OpenRouter doesn't provide rate limit headers in free tier
    // This would need to be implemented with external monitoring
    return Promise.resolve(null);
  }
}

// Singleton instance
export const moeOrchestrator = new MoEOrchestrator();

// Convenience functions for common workflows
export const analyzeNutritionImage = async (imageData: string): Promise<MoEResponse[]> => {
  const prompt = `Analyze this food image and provide nutritional information. Image data: ${imageData}`;
  return moeOrchestrator.executeWorkflow('nutrition-analysis', prompt);
};

export const calculateWorkoutPlan = async (userProfile: any): Promise<MoEResponse[]> => {
  const prompt = `Create a personalized workout plan for: ${JSON.stringify(userProfile)}`;
  return moeOrchestrator.executeWorkflow('workout-planning', prompt);
};

export const processUserQuery = async (query: string): Promise<MoEResponse[]> => {
  return moeOrchestrator.executeWorkflow('general-query', query);
};