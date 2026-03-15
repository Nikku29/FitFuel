/**
 * FitFuel - Gold Standard AI Configuration
 * Pure OpenRouter MoE (Mixture of Experts) Architecture
 * 
 * All AI calls route through https://openrouter.ai/api/v1
 * Set VITE_OPENROUTER_API_KEY in .env
 */

export const AI_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  MODELS: {
    LOGIC: 'tngtech/deepseek-r1t2-chimera',       // For Workout Math & Plans
    CREATIVE: 'mistralai/devstral-2512',          // For UI/UX & Meals
    CHAT: 'xiaomi/mimo-v2-flash',                 // For Fast Chat
    VISUAL: 'bytedance-seed/seedream-4.5',        // For Diagram Generation
    VISION: 'openai/gpt-4o-mini',                 // For Food Camera (Reliable & Cheap) - DEPRECATED
    // Nutrition Scanner MoE Pipeline Models
    PORTION: 'allenai/molmo-2-8b-1024',           // Spatial Grounding & Portion Estimation
    REASONING: 'google/gemini-2.0-flash-exp:free', // Identification & Nutritional Reasoning
    STRUCTURING: 'qwen/qwen-2.5-vl-7b-instruct',  // Pure JSON extraction & formatting
  },
  HEADERS: (apiKey: string): Record<string, string> => {
    const referer = typeof window !== 'undefined' && window.location?.href
      ? window.location.href
      : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');
    return {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
      'X-Title': import.meta.env.VITE_APP_TITLE || 'FitFuel',
      'Content-Type': 'application/json',
    };
  },
} as const;

// Legacy exports for backward compatibility (deprecated, use AI_CONFIG)
export const OPENROUTER_BASE = AI_CONFIG.BASE_URL;
export const MODEL_LOGIC_PLANNER = AI_CONFIG.MODELS.LOGIC;
export const MODEL_CREATIVE_ARCHITECT = AI_CONFIG.MODELS.CREATIVE;
export const MODEL_FAST_CHAT = AI_CONFIG.MODELS.CHAT;
export const MODEL_IMAGE_GEN = AI_CONFIG.MODELS.VISUAL;
export const MODEL_VISION = AI_CONFIG.MODELS.VISION;
export const MODEL_PORTION = AI_CONFIG.MODELS.PORTION;
export const MODEL_REASONING = AI_CONFIG.MODELS.REASONING;
export const MODEL_STRUCTURING = AI_CONFIG.MODELS.STRUCTURING;
export const OPENROUTER_HEADERS = AI_CONFIG.HEADERS;
