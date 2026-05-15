// ============================================================================
// Credit Service (Supabase implementation)
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

export class CreditService {
    /**
     * Check if user has credits to change profile
     * Subscription model: Each profile change costs 1 credit
     */
    static async checkCredits(userId: string): Promise<{ hasCredits: boolean; credits: number; tier: string }> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('credits, tier')
                .eq('id', userId)
                .single();
            
            if (error || !data) {
                return { hasCredits: false, credits: 0, tier: 'FREE' };
            }
            
            const credits = data.credits || 0;
            const tier = data.tier || 'FREE';
            
            // PRO tier gets unlimited
            if (tier === 'PRO') {
                return { hasCredits: true, credits: -1, tier: 'PRO' };
            }
            
            return { hasCredits: credits > 0, credits, tier: 'FREE' };
        } catch (error) {
            console.error('Error checking credits:', error);
            return { hasCredits: false, credits: 0, tier: 'FREE' };
        }
    }
    
    /**
     * Deduct credit when user changes profile
     */
    static async deductCreditForProfileChange(userId: string): Promise<{ success: boolean; remainingCredits: number }> {
        try {
            const { hasCredits, tier } = await this.checkCredits(userId);
            
            if (tier === 'PRO') {
                return { success: true, remainingCredits: -1 };
            }
            
            if (!hasCredits) {
                return { success: false, remainingCredits: 0 };
            }
            
            // Use RPC-style atomic decrement
            const { data, error } = await supabase.rpc('decrement_credits', { user_id: userId });
            
            if (error) {
                // Fallback: direct update with read-modify-write
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits, profile_changes_count')
                    .eq('id', userId)
                    .single();
                
                const newCredits = Math.max(0, (profile?.credits || 0) - 1);
                const newCount = (profile?.profile_changes_count || 0) + 1;
                
                await supabase
                    .from('profiles')
                    .update({
                        credits: newCredits,
                        last_profile_change: new Date().toISOString(),
                        profile_changes_count: newCount
                    })
                    .eq('id', userId);
                
                console.log(`[CreditService] Deducted 1 credit. Remaining: ${newCredits}`);
                return { success: true, remainingCredits: newCredits };
            }
            
            // Get updated credits
            const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();
            
            const updatedCredits = updatedProfile?.credits || 0;
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
            const { data: profile } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();
            
            const newCredits = (profile?.credits || 0) + amount;
            
            const { error } = await supabase
                .from('profiles')
                .update({
                    credits: newCredits,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) throw error;
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
            const initialCredits = tier === 'PRO' ? -1 : 3;
            
            const { error } = await supabase
                .from('profiles')
                .update({
                    credits: initialCredits,
                    tier,
                    credits_initialized_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) throw error;
            console.log(`[CreditService] Initialized ${initialCredits === -1 ? 'unlimited' : initialCredits} credits for ${tier} tier`);
        } catch (error) {
            console.error('Error initializing credits:', error);
            throw error;
        }
    }
}
