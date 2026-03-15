import { z } from "zod";

export const UserProfileSchema = z.object({
  uid: z.string(),
  biometrics: z.object({
    age: z.number(),
    weight_kg: z.number(),
    height_cm: z.number(),
    gender: z.enum(["male", "female", "other"]),
  }),
  goals: z.object({
    primary: z.enum(["hypertrophy", "strength", "weight_loss"]),
    days_per_week: z.number().min(1).max(7),
  }),
});

export const WorkoutPlanSchema = z.object({
  week_start: z.string(),
  sessions: z.array(
    z.object({
      day: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.number(),
          reps: z.union([z.number(), z.string()]),
          visual_tag: z.string(), // "squat_barbell" for image lookup
        })
      ),
    })
  ),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;

