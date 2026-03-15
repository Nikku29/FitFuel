export class SafetySanitizer {
    /**
     * The Logic Firewall. 
     * Enforces strict mathematical and physiological constraints on the generated plan.
     */
    static sanitizeSession(session: any): any {
        // Fix: Explicitly return safe structure if input is invalid
        if (!session || !session.exercises || !Array.isArray(session.exercises)) {
            console.warn("[SafetySanitizer] Invalid session input. Returning empty safe structure.");
            return { exercises: [] };
        }

        console.log("[SafetySanitizer] Scanning session for physiological anomalies...");

        // Constraint 1: Volume Cap (The "Reasonable Workout" Rule)
        if (session.exercises.length > 8) {
            console.warn(`[Safety] Pruning volume from ${session.exercises.length} to 8.`);
            session.exercises = session.exercises.slice(0, 8);
        }

        session.exercises = session.exercises.map((ex: any) => {
            const sanitized = { ...ex };

            // Normalize inputs
            // Fix: Handle cases where sets might be missing or explicitly null
            let sets = parseInt(sanitized.sets) || 0;
            let duration = this.parseDuration(sanitized.duration);

            // Constraint 2: The "Sanity Cap" (Kinesiology Fix)
            // Rule: No human needs to plank for 7 minutes. Cap implies "per set".

            const isIsometric = /plank|hold|sit|static|wall/i.test(sanitized.name);
            const isCore = /abs|core|twist|crunch|raise/i.test(sanitized.name) || isIsometric;

            // DURATION CAP
            if (duration > 120) {
                console.warn(`[Safety] Unrealistic duration (${duration}s) detected. Resetting to 45s.`);
                sanitized.duration = "45 sec";
                sanitized.duration_seconds = 45;
                duration = 45;
            } else if (isIsometric && duration > 60) {
                console.warn(`[Safety] Capping isometric '${sanitized.name}' to 60s.`);
                sanitized.duration = "60 sec";
                sanitized.duration_seconds = 60;
                duration = 60;
            } else if (!isIsometric && duration > 90) {
                console.warn(`[Safety] Capping dynamic '${sanitized.name}' to 90s.`);
                sanitized.duration = "90 sec";
                sanitized.duration_seconds = 90;
                duration = 90;
            }

            // SET CAP
            if (isCore && sets > 4) {
                console.warn(`[Safety] Cap core volume: ${sets} -> 4 sets.`);
                sanitized.sets = 4;
                sets = 4;
            }

            // Constraint 3: The Lazy Set Fix (Anti-Laziness)
            // Rule: Min 3 sets for everything except explicitly heavy 1RM or cardio.
            const isCardio = /run|jog|jump|burpee/i.test(sanitized.name);
            if (sets < 3 && !isCardio && !sanitized.name.toLowerCase().includes('max')) {
                // Ensure we don't accidentally pump volume up if we just capped it down for core/safety, 
                // but generally 3 is a safe floor even for core. 
                // However, "Min 3-4" means we should stick to 3.
                // console.warn(`[Safety] Lazy AI Set Count (${sets}) detected. Forcing to 3.`);
                sanitized.sets = 3;
            }

            // Constraint 4: The Rest Safety Net (DYNAMIC)
            // Logic: Trust the AI unless it's dangerous.
            // Acceptable Range: 15s - 240s
            const aiRest = sanitized.rest_seconds;

            if (!aiRest || aiRest < 15 || aiRest > 240) {
                // Outlier detected. Apply sensible default.
                const isCompound = /squat|deadlift|bench|press|row/i.test(sanitized.name);
                sanitized.rest_seconds = isCompound ? 90 : 45;
                console.warn(`[Safety] Fixed unsafe rest (${aiRest}s) for ${sanitized.name} -> ${sanitized.rest_seconds}s`);
            } else {
                // AI is within reason. Keep it.
                // console.log(`[Safety] Preserving AI Rest: ${aiRest}s for ${sanitized.name}`);
            }

            sanitized.restTime = sanitized.rest_seconds; // Legacy compat

            // Constraint 5: Formatting Clarity
            // Fix: Safely convert sets to string, defaulting to "3" if still invalid
            sanitized.sets = (sanitized.sets || 3).toString();

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
