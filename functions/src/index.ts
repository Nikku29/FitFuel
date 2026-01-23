
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "us-central1" });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  query: string;
  personalizationContext?: string;
}

export const aiAssistant = onRequest(async (request, response) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    response.set(corsHeaders);
    response.status(200).send();
    return;
  }

  // Set CORS headers for actual request
  response.set(corsHeaders);

  try {
    const { query, personalizationContext } = request.body as RequestData;

    if (!query) {
      throw new Error('Query is required');
    }

    console.log(`Processing AI request with context: ${personalizationContext?.substring(0, 100)}...`);

    // Create a detailed system prompt for health and fitness
    let systemPrompt = `You are FitFusion AI, an expert fitness and nutrition assistant. You provide evidence-based, personalized advice for workouts, nutrition, and wellness.

IMPORTANT GUIDELINES:
- Always prioritize user safety and recommend consulting healthcare professionals for medical conditions
- Provide specific, actionable advice when possible
- Consider allergies, medical conditions, and activity restrictions when giving recommendations
- Suggest modifications for different fitness levels
- Include proper form instructions for exercises
- Provide balanced nutrition advice that aligns with dietary preferences
- If health conditions are mentioned, emphasize the importance of medical supervision

RESPONSE STYLE:
- Be encouraging and motivational
- Use clear, easy-to-understand language
- Structure responses with bullet points or numbered lists when helpful
- Include specific examples and practical tips
- Keep responses comprehensive but concise (aim for 150-300 words)`;

    if (personalizationContext) {
      systemPrompt += `\n\nUSER PROFILE:\n${personalizationContext}`;
      systemPrompt += `\n\nUse this profile information to personalize your advice. Consider their specific goals, restrictions, and preferences in your response.`;
    }

    // TODO: Replace with your GEMINI_API_KEY from Firebase Functions environment
    // Set this in Firebase Console -> Functions -> Environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Using Gemini API for better health and fitness responses
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUSER QUERY: ${query}`
          }]
        }]
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("Gemini API Error:", errText);
      // Fallback to rule-based responses if the model fails
      const fallbackResponse = generateFallbackResponse(query, personalizationContext);

      response.status(200).json({
        answer: fallbackResponse,
        source: "fallback"
      });
      return;
    }

    const result = await apiResponse.json();
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

    console.log(`Generated personalized response: ${answer.substring(0, 50)}...`);

    response.status(200).json({
      answer,
      source: "gemini"
    });

  } catch (error) {
    console.error("Error in AI assistant function:", error);

    // Return a friendly error message
    response.status(500).json({
      answer: "I'm sorry, I'm having trouble processing that request right now. Could you try again in a moment?",
      error: error.message
    });
  }
});

// Enhanced fallback response generator
function generateFallbackResponse(query: string, personalizationContext?: string): string {
  const lowerQuery = query.toLowerCase();

  // Extract user info from context if available
  const hasAllergies = personalizationContext?.includes('Allergies');
  const hasMedicalConditions = personalizationContext?.includes('Medical Conditions');
  const hasActivityRestrictions = personalizationContext?.includes('Activity Restrictions');
  const fitnessGoal = personalizationContext?.match(/Fitness Goal: ([^.]+)/)?.[1];
  const dietaryPreference = personalizationContext?.match(/Dietary Preference: ([^.]+)/)?.[1];

  let response = "Hi there! ";

  // Health and safety disclaimer for users with medical conditions
  if (hasMedicalConditions || hasActivityRestrictions) {
    response += "Given your health information, I recommend consulting with your healthcare provider before starting any new fitness or nutrition program. ";
  }

  if (lowerQuery.includes("workout") || lowerQuery.includes("exercise") || lowerQuery.includes("routine")) {
    if (fitnessGoal?.includes("Weight Loss")) {
      response += "For weight loss, focus on combining cardio and strength training. Try 30-45 minutes of moderate cardio 4-5 times per week, plus 2-3 strength sessions. HIIT workouts are also excellent for burning calories efficiently.";
    } else if (fitnessGoal?.includes("Muscle Gain")) {
      response += "For muscle building, prioritize progressive strength training with compound movements like squats, deadlifts, bench press, and rows. Aim for 3-4 sessions per week, focusing on 6-12 reps with challenging weights.";
    } else {
      response += "A balanced routine includes both cardio and strength training. Aim for 150 minutes of moderate cardio weekly plus 2-3 strength sessions. Start with basic movements and progress gradually.";
    }

    if (hasActivityRestrictions) {
      response += " Make sure to modify exercises based on your restrictions and consider working with a qualified trainer.";
    }
  } else if (lowerQuery.includes("diet") || lowerQuery.includes("nutrition") || lowerQuery.includes("eat")) {
    response += "Focus on whole, nutrient-dense foods. Include lean proteins, complex carbs, healthy fats, and plenty of vegetables.";

    if (dietaryPreference?.includes("Vegan")) {
      response += " For a vegan diet, ensure adequate protein from legumes, nuts, seeds, and whole grains. Consider B12, iron, and omega-3 supplementation.";
    } else if (dietaryPreference?.includes("Vegetarian")) {
      response += " As a vegetarian, combine different protein sources and include iron-rich foods with vitamin C for better absorption.";
    }

    if (hasAllergies) {
      response += " Always check ingredient labels carefully and consider working with a registered dietitian to ensure nutritional adequacy while avoiding allergens.";
    }
  } else if (lowerQuery.includes("motivation") || lowerQuery.includes("habit")) {
    response += "Building healthy habits takes time and consistency. Start small, track your progress, and celebrate small wins. Find activities you enjoy and consider finding a workout buddy for accountability.";
  } else {
    response += "I'm here to help with fitness and nutrition questions! You can ask about workout routines, meal planning, habit formation, or specific health and wellness topics.";
  }

  return response;
}
