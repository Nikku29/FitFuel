/**
 * FitFuelRepository
 * 
 * This repository class handles all database operations related to fitness plans,
 * user history, biometrics, and exercises for the FitFuel application.
 */

import { Database } from '../database/Database';

export interface FitnessPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface UserHistory {
  id: string;
  userId: string;
  date: Date;
  planId: string;
  completedExercises: number;
  totalExercises: number;
  duration: number; // in minutes
  notes: string;
}

export interface Biometrics {
  id: string;
  userId: string;
  weight: number; // in kg
  height: number; // in cm
  bodyFatPercentage: number;
  bmr: number; // Basal Metabolic Rate
  recordedAt: Date;
}

export interface Exercise {
  id: string;
  planId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // in kg
  duration: number; // in seconds
  restPeriod: number; // in seconds
  notes: string;
  createdAt: Date;
}

export class FitFuelRepository {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Saves a new fitness plan to the database
   * @param userId - The ID of the user
   * @param plan - The fitness plan object to save
   * @returns Promise<FitnessPlan> - The saved fitness plan with ID
   */
  async savePlan(userId: string, plan: Omit<FitnessPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<FitnessPlan> {
    try {
      const now = new Date();
      const planData = {
        ...plan,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const savedPlan = await this.database.insert('fitness_plans', planData);
      
      return {
        id: savedPlan.id,
        ...planData,
      };
    } catch (error) {
      throw new Error(`Failed to save fitness plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches the workout history for a specific user
   * @param userId - The ID of the user
   * @param limit - Maximum number of records to fetch (default: 30)
   * @param offset - Number of records to skip (default: 0)
   * @returns Promise<UserHistory[]> - Array of user history records
   */
  async fetchUserHistory(userId: string, limit: number = 30, offset: number = 0): Promise<UserHistory[]> {
    try {
      const query = {
        userId,
      };

      const history = await this.database.query('user_history', query, {
        orderBy: 'date',
        order: 'DESC',
        limit,
        offset,
      });

      return history as UserHistory[];
    } catch (error) {
      throw new Error(`Failed to fetch user history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches user history for a specific date range
   * @param userId - The ID of the user
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @returns Promise<UserHistory[]> - Array of user history records within the date range
   */
  async fetchUserHistoryByDateRange(userId: string, startDate: Date, endDate: Date): Promise<UserHistory[]> {
    try {
      const query = {
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const history = await this.database.query('user_history', query, {
        orderBy: 'date',
        order: 'DESC',
      });

      return history as UserHistory[];
    } catch (error) {
      throw new Error(`Failed to fetch user history by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates user biometric data
   * @param userId - The ID of the user
   * @param biometrics - The biometric data to update
   * @returns Promise<Biometrics> - The updated biometric record
   */
  async updateBiometrics(userId: string, biometrics: Omit<Biometrics, 'id' | 'userId' | 'recordedAt'>): Promise<Biometrics> {
    try {
      const biometricData = {
        ...biometrics,
        userId,
        recordedAt: new Date(),
      };

      const updated = await this.database.insert('biometrics', biometricData);

      return {
        id: updated.id,
        ...biometricData,
      };
    } catch (error) {
      throw new Error(`Failed to update biometrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches the latest biometric record for a user
   * @param userId - The ID of the user
   * @returns Promise<Biometrics | null> - The latest biometric record or null if none exists
   */
  async getLatestBiometrics(userId: string): Promise<Biometrics | null> {
    try {
      const query = {
        userId,
      };

      const biometrics = await this.database.query('biometrics', query, {
        orderBy: 'recordedAt',
        order: 'DESC',
        limit: 1,
      });

      return (biometrics && biometrics.length > 0 ? biometrics[0] : null) as Biometrics | null;
    } catch (error) {
      throw new Error(`Failed to fetch latest biometrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new exercise for a fitness plan
   * @param planId - The ID of the fitness plan
   * @param exercise - The exercise data to save
   * @returns Promise<Exercise> - The saved exercise with ID
   */
  async saveExercise(planId: string, exercise: Omit<Exercise, 'id' | 'planId' | 'createdAt'>): Promise<Exercise> {
    try {
      const exerciseData = {
        ...exercise,
        planId,
        createdAt: new Date(),
      };

      const saved = await this.database.insert('exercises', exerciseData);

      return {
        id: saved.id,
        ...exerciseData,
      };
    } catch (error) {
      throw new Error(`Failed to save exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches all exercises for a specific fitness plan
   * @param planId - The ID of the fitness plan
   * @returns Promise<Exercise[]> - Array of exercises in the plan
   */
  async fetchExercisesByPlan(planId: string): Promise<Exercise[]> {
    try {
      const query = {
        planId,
      };

      const exercises = await this.database.query('exercises', query, {
        orderBy: 'createdAt',
        order: 'ASC',
      });

      return exercises as Exercise[];
    } catch (error) {
      throw new Error(`Failed to fetch exercises: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an existing exercise
   * @param exerciseId - The ID of the exercise to update
   * @param updates - The fields to update
   * @returns Promise<Exercise> - The updated exercise
   */
  async updateExercise(exerciseId: string, updates: Partial<Omit<Exercise, 'id' | 'planId' | 'createdAt'>>): Promise<Exercise> {
    try {
      const updated = await this.database.update('exercises', { id: exerciseId }, updates);

      return updated as Exercise;
    } catch (error) {
      throw new Error(`Failed to update exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes an exercise from the database
   * @param exerciseId - The ID of the exercise to delete
   * @returns Promise<boolean> - True if deletion was successful
   */
  async deleteExercise(exerciseId: string): Promise<boolean> {
    try {
      await this.database.delete('exercises', { id: exerciseId });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logs a completed workout session
   * @param userId - The ID of the user
   * @param sessionData - The workout session data
   * @returns Promise<UserHistory> - The logged session record
   */
  async logWorkoutSession(userId: string, sessionData: Omit<UserHistory, 'id' | 'userId'>): Promise<UserHistory> {
    try {
      const session = {
        ...sessionData,
        userId,
      };

      const saved = await this.database.insert('user_history', session);

      return {
        id: saved.id,
        ...session,
      };
    } catch (error) {
      throw new Error(`Failed to log workout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches all fitness plans for a user
   * @param userId - The ID of the user
   * @returns Promise<FitnessPlan[]> - Array of fitness plans
   */
  async fetchUserPlans(userId: string): Promise<FitnessPlan[]> {
    try {
      const query = {
        userId,
      };

      const plans = await this.database.query('fitness_plans', query, {
        orderBy: 'createdAt',
        order: 'DESC',
      });

      return plans as FitnessPlan[];
    } catch (error) {
      throw new Error(`Failed to fetch user plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates a fitness plan
   * @param planId - The ID of the plan to update
   * @param updates - The fields to update
   * @returns Promise<FitnessPlan> - The updated plan
   */
  async updatePlan(planId: string, updates: Partial<Omit<FitnessPlan, 'id' | 'userId' | 'createdAt'>>): Promise<FitnessPlan> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const updated = await this.database.update('fitness_plans', { id: planId }, updateData);

      return updated as FitnessPlan;
    } catch (error) {
      throw new Error(`Failed to update plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a fitness plan and associated exercises
   * @param planId - The ID of the plan to delete
   * @returns Promise<boolean> - True if deletion was successful
   */
  async deletePlan(planId: string): Promise<boolean> {
    try {
      // Delete associated exercises first
      await this.database.delete('exercises', { planId });
      // Delete the plan
      await this.database.delete('fitness_plans', { id: planId });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
