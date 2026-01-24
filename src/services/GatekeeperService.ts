
import { UserData } from '@/contexts/UserContextTypes';

export class GatekeeperService {
    /**
     * Checks if the user has PRO access.
     */
    static isProAccess(user: UserData | null): boolean {
        if (!user) return false;
        return user.tier === 'PRO';
    }

    /**
     * Checks if the user has sufficient credits for an action.
     */
    static hasCredits(user: UserData | null, cost: number = 1): boolean {
        if (!user) return false;
        // Unlimited credits for PRO users? Or tracked?
        // For now, assume PRO implies unlimited or high cap, but checked via credits field for granularity.
        // If requirement implies PRO = Unlimited generative, we can just return true.
        // Spec says "Track credits in users/{uid}/credits".
        return (user.credits || 0) >= cost;
    }

    /**
     * Returns true if static mode should be enforced.
     * This is the inverse of isProAccess but explicit for readability.
     */
    static enforceStaticMode(user: UserData | null): boolean {
        return !this.isProAccess(user);
    }

    /**
     * Returns the correct data source based on tier.
     */
    static resolveDataSource<T>(user: UserData | null, staticData: T, activeDataFactory: () => T): T {
        if (this.enforceStaticMode(user)) {
            console.log("Gatekeeper: Enforcing STATIC mode for FREE tier.");
            return staticData;
        }
        console.log("Gatekeeper: Allowing ACTIVE mode for PRO tier.");
        return activeDataFactory();
    }
}
