import { UserData } from '@/contexts/UserContextTypes';
import { TrainerContext } from '@/types/aiTypes';

export const buildTrainerContext = (user: UserData, userQuery: string): TrainerContext => {
    const query = userQuery.toLowerCase();
    let readiness = 7; // Default
    let focus: TrainerContext['focus_mode'] = 'Balanced';

    // 1. Readiness Calculation (NLP Keywords)
    if (query.match(/tired|sore|stressed|late night|exhausted|bad sleep/)) {
        readiness = 3;
        focus = 'Active_Recovery';
    } else if (query.match(/energetic|fresh|angry|pumped|strong|ready/)) {
        readiness = 9;
        focus = 'Strength';
    }

    // 2. Injury Clustering
    const contraindications: string[] = [];
    const conditions = (user.medicalConditions || '').toLowerCase();

    if (conditions.includes('knee')) {
        contraindications.push('High_Impact', 'Deep_Knee_Flexion_Load', 'Shearing_Forces');
    }
    if (conditions.includes('back') || conditions.includes('spine') || conditions.includes('lumbar')) {
        contraindications.push('Spinal_Loading', 'Twisting_Under_Load', 'Heavy_Deadlifts');
    }
    if (conditions.includes('shoulder') || conditions.includes('rotator')) {
        contraindications.push('Overhead_Press_Heavy', 'Deep_Dips');
    }
    if (conditions.includes('ankle')) {
        contraindications.push('High_Impact', 'Unstable_Surface');
    }

    return {
        readiness_score: readiness,
        focus_mode: focus,
        contraindicated_patterns: contraindications,
        available_time: 45 // Default, could be parsed from query
    };
};
