export class SafetySanitizer {
    /**
     * The Logic Firewall. 
     * Enforces strict mathematical and physiological constraints on the generated plan.
     */
    static sanitizeSession(session: any): any {
        if (!session || !session.exercises) return session;

        console.log("[SafetySanitizer] Scanning session for physiological anomalies...");

        // Constraint 1: Volume Cap (The "Reasonable Workout" Rule)
        if (session.exercises.length > 8) {
            console.warn(`[Safety] Pruning volume from ${session.exercises.length} to 8.`);
            session.exercises = session.exercises.slice(0, 8);
        }

        session.exercises = session.exercises.map((ex: any) => {
            const sanitized = { ...ex };

            // Normalize inputs
            let sets = parseInt(sanitized.sets) || 0;
            let duration = this.parseDuration(sanitized.duration);

            // Constraint 2: The Plank Fix (Splitting Isometrics)
            // Rule: Isometric hold > 60s MUST be split into sets.
            // e.g., 7 mins -> 7 sets of 60s.
            const isIsometric = /plank|hold|sit|static|wall/i.test(sanitized.name);
            if (isIsometric && duration > 60) {
                const calculatedSets = Math.ceil(duration / 60);
                console.warn(`[Safety] Splitting isomeric '${sanitized.name}' (${duration}s) into ${calculatedSets} sets.`);

                sanitized.sets = calculatedSets; // INT
                sanitized.duration = "60 sec";   // String for UI
                sanitized.duration_seconds = 60; // Int for Logic
                sets = calculatedSets; // Update local tracking
            }

            // Constraint 3: The Lazy Set Fix (Anti-Laziness)
            // Rule: Min 3 sets for everything except explicitly heavy 1RM or cardio.
            const isCardio = /run|jog|jump|burpee/i.test(sanitized.name);
            if (sets < 3 && !isCardio && !sanitized.name.toLowerCase().includes('max')) {
                console.warn(`[Safety] Lazy AI Set Count (${sets}) detected. Forcing to 3.`);
                sanitized.sets = 3;
            }

            // Constraint 4: The Rest Injector
            // Rule: Default rest is 45s. Compounds get 90s.
            if (!sanitized.rest_seconds) {
                const isCompound = /squat|deadlift|bench|press|row/i.test(sanitized.name);
                sanitized.rest_seconds = isCompound ? 90 : 45;
                sanitized.restTime = sanitized.rest_seconds; // Legacy compat
            }

            // Constraint 5: Formatting Clarity
            // Ensure sets is a clean number in the final output if possible, or string if UI expects it
            // We'll standardise on string for 'sets' prop to match existing UI, but ensure it's valid
            sanitized.sets = sanitized.sets.toString();

            return sanitized;
        });

        return session;
    }

    private static parseDuration(dur: string | undefined): number {
        if (!dur) return 0;
        if (typeof dur === 'number') return dur;

        const parts = dur.split(' ');
        const val = parseInt(parts[0]);
        if (isNaN(val)) return 0;

        if (dur.includes('min')) return val * 60;
        return val; // Assume seconds
    }
}
