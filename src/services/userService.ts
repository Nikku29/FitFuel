
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../integrations/firebase/config';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;

    // Physical Stats
    age?: number;
    gender?: 'Male' | 'Female' | 'Other' | string;
    weight?: number; // kg
    height?: number; // cm

    // Preferences
    location?: string;
    fitnessGoal?: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'General Fitness' | string;
    activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active' | string;
    dietaryPreference?: 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo' | 'None' | string;

    // Metadata
    onboardingCompleted: boolean;
    createdAt: any;
    updatedAt: any;
}

export class UserService {
    private static COLLECTION = 'users';

    /**
     * Creates or updates a user in the 'users' collection.
     * This is the standardized way to save user data.
     */
    static async syncUser(uid: string, data: Partial<UserProfile>) {
        try {
            const userRef = doc(db, this.COLLECTION, uid);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
                await updateDoc(userRef, {
                    ...data,
                    updatedAt: serverTimestamp()
                });
            } else {
                await setDoc(userRef, {
                    uid,
                    ...data,
                    onboardingCompleted: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            return { success: true, error: null };
        } catch (error: any) {
            console.error("UserService Error:", error);
            return { success: false, error };
        }
    }

    static async getUser(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, this.COLLECTION, uid);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                return snapshot.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error("UserService Get Error:", error);
            return null;
        }
    }
}
