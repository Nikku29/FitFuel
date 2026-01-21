
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, AnonymousSession } from './types';

// Profile operations replaced by 'users' collection standardization
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Map 'users' schema back to 'UserProfile' interface expected by frontend
      return {
        id: docSnap.id,
        full_name: data.displayName || data.full_name,
        email: data.email,
        username: data.username,
        dob: data.dob,
        gender: data.gender,
        weight_kg: data.weight || data.weight_kg,
        height_cm: data.height || data.height_cm,
        location: data.location,
        fitness_goal: data.fitnessGoal || data.fitness_goal,
        fitness_level: data.activityLevel || data.fitness_level,
        diet_preference: data.dietaryPreference || data.diet_preference,
        created_at: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
        updated_at: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined
      } as any;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const createProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', userId);
    // Merge provided data, preferring camelCase for new standard but supporting legacy keys
    await setDoc(docRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { error };
  }
};

export const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    }, { merge: true }); // Use setDoc with merge to ensure it works even if document doesn't exist
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};

// Anonymous session operations
export const createAnonymousSession = async (sessionData: Omit<AnonymousSession, 'id' | 'created_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'anonymous_sessions'), {
      ...sessionData,
      expires_at: Timestamp.fromDate(sessionData.expires_at),
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    return { id: null, error };
  }
};

export const getAnonymousSession = async (sessionToken: string): Promise<AnonymousSession | null> => {
  try {
    const q = query(
      collection(db, 'anonymous_sessions'),
      where('session_token', '==', sessionToken),
      where('expires_at', '>', Timestamp.now())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      const data = docData.data();
      return {
        id: docData.id,
        ...data,
        expires_at: data.expires_at.toDate(),
        created_at: data.created_at.toDate()
      } as AnonymousSession;
    }
    return null;
  } catch (error) {
    console.error('Error fetching anonymous session:', error);
    return null;
  }
};

export const updateAnonymousSession = async (sessionId: string, sessionData: Partial<AnonymousSession>) => {
  try {
    const docRef = doc(db, 'anonymous_sessions', sessionId);
    await updateDoc(docRef, sessionData);
    return { error: null };
  } catch (error) {
    console.error('Error updating anonymous session:', error);
    return { error };
  }
};

export const deleteAnonymousSession = async (sessionId: string) => {
  try {
    const docRef = doc(db, 'anonymous_sessions', sessionId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting anonymous session:', error);
    return { error };
  }
};

// Extended Collections Operations

// Workout Logs
export interface WorkoutLog {
  id?: string;
  userId: string;
  workoutId: string;
  workoutTitle: string;
  duration: number; // in minutes
  caloriesBurned: number;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
  }[];
  notes?: string;
  rating?: number; // 1-5
  date: Date;
  created_at?: Date;
}

export const logWorkout = async (workoutLog: Omit<WorkoutLog, 'id' | 'created_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'workout_logs'), {
      ...workoutLog,
      date: Timestamp.fromDate(workoutLog.date),
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { id: null, error };
  }
};

export const getUserWorkoutLogs = async (userId: string, limit: number = 50) => {
  try {
    const q = query(
      collection(db, 'workout_logs'),
      where('userId', '==', userId),
      // orderBy('date', 'desc'),
      // limitQuery(limit)
    );
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      created_at: doc.data().created_at?.toDate()
    })) as WorkoutLog[];

    return { logs, error: null };
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return { logs: [], error };
  }
};

// Workout Plans
export interface WorkoutPlan {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  workoutIds: string[];
  // AI Generated Content Support
  exercises?: {
    name: string;
    duration?: string;
    reps?: string;
    sets?: string;
    description: string;
    targetMuscles: string[];
  }[];
  difficulty?: string;
  duration?: string;
  benefits?: string[];

  schedule: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  isActive: boolean;
  isFavorite?: boolean; // Added for User Request
  created_at?: Date;
  updated_at?: Date;
}

export const createWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'workout_plans'), {
      ...plan,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { id: null, error };
  }
};

export const getUserWorkoutPlans = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'workout_plans'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    const plans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate()
    })) as WorkoutPlan[];

    return { plans, error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { plans: [], error };
  }
};

// User Favorites
export interface UserFavorite {
  id?: string;
  userId: string;
  itemId: string;
  itemType: 'workout' | 'recipe';
  itemTitle: string;
  created_at?: Date;
}

export const addToFavorites = async (favorite: Omit<UserFavorite, 'id' | 'created_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'user_favorites'), {
      ...favorite,
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { id: null, error };
  }
};

export const removeFromFavorites = async (userId: string, itemId: string, itemType: string) => {
  try {
    const q = query(
      collection(db, 'user_favorites'),
      where('userId', '==', userId),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
    }

    return { error: null };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { error };
  }
};

export const getUserFavorites = async (userId: string, itemType?: string) => {
  try {
    let q = query(
      collection(db, 'user_favorites'),
      where('userId', '==', userId)
    );

    if (itemType) {
      q = query(q, where('itemType', '==', itemType));
    }

    const querySnapshot = await getDocs(q);

    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()
    })) as UserFavorite[];

    return { favorites, error: null };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { favorites: [], error };
  }
};

// User Progress
export interface UserProgress {
  id?: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  fitnessMetrics?: {
    restingHeartRate?: number;
    bloodPressure?: string;
    vo2Max?: number;
  };
  goals?: {
    targetWeight?: number;
    targetBodyFat?: number;
    weeklyWorkouts?: number;
  };
  notes?: string;
  created_at?: Date;
}

export const recordProgress = async (progress: Omit<UserProgress, 'id' | 'created_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'user_progress'), {
      ...progress,
      date: Timestamp.fromDate(progress.date),
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error recording progress:', error);
    return { id: null, error };
  }
};

export const getUserProgress = async (userId: string, limit: number = 50) => {
  try {
    const q = query(
      collection(db, 'user_progress'),
      where('userId', '==', userId)
      // orderBy('date', 'desc'),
      // limitQuery(limit)
    );
    const querySnapshot = await getDocs(q);

    const progress = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      created_at: doc.data().created_at?.toDate()
    })) as UserProgress[];

    return { progress, error: null };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return { progress: [], error };
  }
};

// Nutrition Logs
export interface NutritionLog {
  id?: string;
  userId: string;
  foodName: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  image?: string; // Optional URL or base64 placeholder
  mealType?: string; // e.g., 'breakfast', 'lunch'
  date: Date;
  created_at?: Date;
}

export const logNutrition = async (log: Omit<NutritionLog, 'id' | 'created_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'nutrition_logs'), {
      ...log,
      date: Timestamp.fromDate(log.date),
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error logging nutrition:', error);
    return { id: null, error };
  }
};
