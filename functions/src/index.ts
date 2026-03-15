
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { UserProfileSchema, WorkoutPlanSchema, type UserProfile, type WorkoutPlan } from "./shared/schema";

setGlobalOptions({ region: "us-central1" });

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const LOGIC_PLANNER_MODEL = "tngtech/deepseek-r1t2-chimaera";

interface GeneratePlanRequest {
  profile: UserProfile;
}

async function callLogicPlanner(profile: UserProfile): Promise<WorkoutPlan> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in Functions environment");
    throw new HttpsError(
      "failed-precondition",
      "OPENROUTER_API_KEY is not configured on the server."
    );
  }

  const systemPrompt = `
You are MODEL_LOGIC_PLANNER for FitFuel.
You take a structured user profile and generate a one-week workout plan.

REQUIREMENTS:
- Output MUST be valid JSON ONLY, with no markdown.
- It MUST strictly match this TypeScript/Zod shape:

WorkoutPlan = {
  week_start: string; // ISO date string for Monday of the plan
  sessions: {
    day: string; // e.g. "Monday"
    exercises: {
      name: string;
      sets: number;
      reps: number | string;
      visual_tag: string; // machine-friendly key, e.g. "squat_barbell"
    }[];
  }[];
}

- Do not include comments or extra keys.
- Ensure at least one session per training day in profile.goals.days_per_week.
`;

  const userContent = JSON.stringify(profile);

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LOGIC_PLANNER_MODEL,
      temperature: 0.2,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: systemPrompt.trim(),
        },
        {
          role: "user",
          content: `UserProfile JSON:\n${userContent}\n\nReturn ONLY the WorkoutPlan JSON.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("OpenRouter error:", res.status, text);
    throw new HttpsError("internal", "Failed to generate workout plan.");
  }

  const data = (await res.json()) as any;
  const rawContent: string | undefined =
    data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.message?.content?.[0]?.text;

  if (!rawContent) {
    console.error("Unexpected OpenRouter response shape:", JSON.stringify(data).slice(0, 500));
    throw new HttpsError("internal", "No content returned from logic planner.");
  }

  // Strip potential code fences and extract JSON substring
  let clean = String(rawContent).trim();
  clean = clean.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse planner JSON:", clean);
    throw new HttpsError("internal", "Planner returned invalid JSON.");
  }

  try {
    return WorkoutPlanSchema.parse(parsed);
  } catch (err) {
    console.error("WorkoutPlan validation failed:", err);
    throw new HttpsError("internal", "Planner JSON did not match WorkoutPlan schema.");
  }
}

export const generateWorkoutPlan = onCall<GeneratePlanRequest>(async (request) => {
  try {
    const data = request.data;

    if (!data || !data.profile) {
      throw new HttpsError("invalid-argument", "Missing 'profile' in request data.");
    }

    const profile = UserProfileSchema.parse(data.profile);
    const plan = await callLogicPlanner(profile);

    return plan;
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("generateWorkoutPlan error:", error);
    throw new HttpsError("internal", "Failed to generate workout plan.");
  }
});

export const generateMealPlan = onCall<GeneratePlanRequest>(async (request) => {
  // NOTE: For now this reuses the same WorkoutPlanSchema shape.
  // You can introduce a dedicated MealPlan schema in the shared module later.
  try {
    const data = request.data;

    if (!data || !data.profile) {
      throw new HttpsError("invalid-argument", "Missing 'profile' in request data.");
    }

    const profile = UserProfileSchema.parse(data.profile);
    const plan = await callLogicPlanner(profile);

    return plan;
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("generateMealPlan error:", error);
    throw new HttpsError("internal", "Failed to generate meal plan.");
  }
});

