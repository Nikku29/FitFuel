import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export class CreditService {
    /**
     * Check if user has credits to change profile
     * Subscription model: Each profile change costs 1 credit
     */
    static async checkCredits(userId: string): Promise<{ hasCredits: boolean; credits: number; tier: string }> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                return { hasCredits: false, credits: 0, tier: 'FREE' };
            }
            
            const userData = userSnap.data();
            const credits = userData.credits || 0;
            const tier = userData.tier || 'FREE';
            
            // FREE tier gets 3 free profile changes per month
            // PRO tier gets unlimited
            if (tier === 'PRO') {
                return { hasCredits: true, credits: -1, tier: 'PRO' }; // -1 means unlimited
            }
            
            return { hasCredits: credits > 0, credits, tier: 'FREE' };
        } catch (error) {
            console.error('Error checking credits:', error);
            return { hasCredits: false, credits: 0, tier: 'FREE' };
        }
    }
    
    /**
     * Deduct credit when user changes profile
     * This triggers AI regeneration of plans
     */
    static async deductCreditForProfileChange(userId: string): Promise<{ success: boolean; remainingCredits: number }> {
        try {
            const { hasCredits, credits, tier } = await this.checkCredits(userId);
            
            if (tier === 'PRO') {
                // PRO users don't need to deduct credits
                return { success: true, remainingCredits: -1 };
            }
            
            if (!hasCredits) {
                return { success: false, remainingCredits: 0 };
            }
            
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                credits: increment(-1),
                last_profile_change: serverTimestamp(),
                profile_changes_count: increment(1)
            });
            
            // Get updated credits
            const updatedSnap = await getDoc(userRef);
            const updatedCredits = updatedSnap.data()?.credits || 0;
            
            console.log(`[CreditService] Deducted 1 credit. Remaining: ${updatedCredits}`);
            
            return { success: true, remainingCredits: updatedCredits };
        } catch (error) {
            console.error('Error deducting credit:', error);
            return { success: false, remainingCredits: 0 };
        }
    }
    
    /**
     * Add credits (for subscriptions, purchases, etc.)
     */
    static async addCredits(userId: string, amount: number): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                credits: increment(amount),
                last_credit_update: serverTimestamp()
            });
            console.log(`[CreditService] Added ${amount} credits to user ${userId}`);
        } catch (error) {
            console.error('Error adding credits:', error);
            throw error;
        }
    }
    
    /**
     * Initialize credits for new users (FREE tier gets 3)
     */
    static async initializeCredits(userId: string, tier: 'FREE' | 'PRO' = 'FREE'): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            const initialCredits = tier === 'PRO' ? -1 : 3; // -1 = unlimited
            
            await updateDoc(userRef, {
                credits: initialCredits,
                tier,
                credits_initialized_at: serverTimestamp()
            });
            console.log(`[CreditService] Initialized ${initialCredits === -1 ? 'unlimited' : initialCredits} credits for ${tier} tier`);
        } catch (error) {
            console.error('Error initializing credits:', error);
            throw error;
        }
    }
}
