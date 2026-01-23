import { UserData } from '@/contexts/UserContextTypes';
import { PersonalizedWorkout } from '@/types/aiTypes';

export interface SafetyValidationResult {
    safe: boolean;
    reason?: string;
    modifiedSession?: PersonalizedWorkout;
}

export const validateSessionSafety = (session: PersonalizedWorkout, user: UserData, readinessScore: number): SafetyValidationResult => {
    const warnings: string[] = [];

    // 1. Intensity Check vs Readiness
    const isHighIntensity = session.exercises.some(ex =>
        ex.description.match(/1RM|Failure|Heavy|5x5|Max Effort/i) ||
        session.difficulty === 'Advanced'
    );

    if (readinessScore < 4 && isHighIntensity) {
        return {
            safe: false,
            reason: "User is fatigued (Readiness < 4) but session is High Intensity. Risk of CNS burnout.",
            modifiedSession: fallbackRecoverySession()
        };
    }

    // 2. Injury Check (Regex Mappings)
    const exercises = session.exercises.map(e => e.name.toLowerCase());
    const conditions = (user.medicalConditions || '').toLowerCase();

    if (conditions.includes('knee')) {
        const kneeRisks = exercises.filter(ex => ex.match(/jump|box jump|burpee|deep squat|pistol/));
        if (kneeRisks.length > 0) {
            return {
                safe: false,
                reason: `Knee contraindication detected. Dangerous exercises found: ${kneeRisks.join(', ')}`
            };
        }
    }

    if (conditions.includes('back')) {
        const backRisks = exercises.filter(ex => ex.match(/deadlift|barbell squat|good morning|russian twist/));
        if (backRisks.length > 0) {
            return {
                safe: false,
                reason: `Back contraindication detected. Dangerous exercises found: ${backRisks.join(', ')}`
            };
        }
    }

    return { safe: true };
};

const fallbackRecoverySession = (): PersonalizedWorkout => ({
    id: 'safety-override-recovery',
    title: 'Generated Recovery Flow',
    description: 'Trainer Override: Your readiness is low. We switched to active recovery to protect your nervous system.',
    duration: '30 min',
    difficulty: 'Beginner',
    category: 'Mobility',
    exercises: [
        { name: 'Cat-Cow Stretch', duration: '60 sec', description: 'Gentle spinal mobility.', targetMuscles: ['Spine'] },
        { name: 'Child\'s Pose', duration: '60 sec', description: 'Lower back decompression.', targetMuscles: ['Lower Back'] },
        { name: '90-90 Hip Stretch', duration: '90 sec', description: 'Hip mobility.', targetMuscles: ['Hips'] }
    ],
    benefits: ['CNS Recovery', 'Pain Reduction', 'Stress Relief'],
    equipment: ['Mat'],
    calories: 50
});
