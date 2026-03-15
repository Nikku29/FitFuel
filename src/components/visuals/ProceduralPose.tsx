import React from 'react';

type PoseType = 'horizontal_prone' | 'standing_squat' | 'standing_press' | 'seated_row' | 'vertical_hang' | 'seated_twist' | 'supine_leg_lift' | 'side_plank' | 'cobra' | undefined;

interface ProceduralPoseProps {
    pose: PoseType;
    frame: 'start' | 'mid' | 'end';
    color?: string;
}

export const ProceduralPose: React.FC<ProceduralPoseProps> = ({ pose, frame, color = '#1e293b' }) => {
    // Canvas 100x100
    // Standard Stick Figure: Head (50, 20), Body (50, 20 -> 50, 60), Legs (50, 60 -> 30, 90 / 70, 90), Arms (50, 30 -> 30, 50 / 70, 50)

    if (!pose) {
        // Fallback: Standing Neutral
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy="20" r="8" />
                <path d="M50 28 L50 60" />
                <path d="M50 60 L30 90 M50 60 L70 90" />
                <path d="M50 35 L20 45 M50 35 L80 45" />
            </svg>
        );
    }

    // --- POSES ---

    if (pose === 'horizontal_prone') {
        // e.g., Plank, Pushup
        // Head at 20, 80. Feet at 80, 80.
        const yOffset = frame === 'mid' ? 85 : 75; // Pushup: Down(85) vs Up(75). Plank: Static(75)
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="20" cy={yOffset} r="8" />
                <path d={`M28 ${yOffset} L80 ${yOffset} L80 ${yOffset + 5}`} /> {/* Body + Feet */}
                <path d={`M35 ${yOffset} L35 ${yOffset + 15}`} /> {/* Arms */}
            </svg>
        );
    }

    if (pose === 'standing_squat') {
        const squatDepth = frame === 'mid' ? 20 : 0;
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy={20 + squatDepth} r="8" />
                <path d={`M50 ${28 + squatDepth} L50 ${60 + squatDepth}`} />
                <path d={`M50 ${60 + squatDepth} L30 ${90} M50 ${60 + squatDepth} L70 ${90}`} />
                {/* Arms forward for balance */}
                <path d={`M50 ${35 + squatDepth} L80 ${35 + squatDepth}`} />
            </svg>
        );
    }

    if (pose === 'standing_press') {
        const pressHeight = frame === 'mid' ? -15 : 0; // Arms go up
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy="20" r="8" />
                <path d="M50 28 L50 60" />
                <path d="M50 60 L35 90 M50 60 L65 90" />
                {/* Arms Pressing */}
                <path d={`M50 35 L25 ${35 + pressHeight} M50 35 L75 ${35 + pressHeight}`} />
            </svg>
        );
    }

    if (pose === 'vertical_hang') {
        const pullHeight = frame === 'mid' ? 15 : 0;
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy={30 - pullHeight} r="8" />
                <path d={`M50 ${38 - pullHeight} L50 ${70 - pullHeight}`} />
                <path d={`M50 ${70 - pullHeight} L40 ${90 - pullHeight} M50 ${70 - pullHeight} L60 ${90 - pullHeight}`} />
                {/* Arms Hanging/Pulling */}
                <path d={`M50 ${40 - pullHeight} L20 10 M50 ${40 - pullHeight} L80 10`} />
            </svg>
        );
    }

    // --- NEW CORE POSES ---

    if (pose === 'seated_twist') {
        // e.g., Russian Twist. Seated "V" shape.
        const rotation = frame === 'mid' ? 10 : -5;
        const armX = frame === 'mid' ? 70 : 30; // Twisting L/R
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Head */}
                <circle cx="45" cy="30" r="8" />
                {/* Torso (Leaning Back) */}
                <path d="M45 38 L40 70" />
                {/* Legs (Floating) */}
                <path d="M40 70 L70 55 M40 70 L72 60" />
                {/* Arms (Holding weight, twisting) */}
                <path d={`M42 45 L${armX} 55`} />
            </svg>
        );
    }

    if (pose === 'supine_leg_lift') {
        // Lying flat. Legs go up.
        // Ensure bold stroke (6)
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Head */}
                <circle cx="20" cy="85" r="8" />
                {/* Torso (Flat) */}
                <path d="M28 85 L60 85" />
                {/* Legs (Hinged at hip 60,85) */}
                {frame === 'mid'
                    ? <path d="M60 85 L90 20" /> // Legs UP
                    : <path d="M60 85 L95 85" /> // Legs DOWN
                }
                {/* Arms (Stabilizing) */}
                <path d="M30 85 L30 95" />
            </svg>
        );
    }

    if (pose === 'side_plank') {
        // Diagonal Body. One arm down.
        const armY = 75;
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Head */}
                <circle cx="30" cy="30" r="8" />
                {/* Body (Diagonal) */}
                <path d="M35 38 L80 80" />
                {/* Leg (Straight) */}
                <path d="M80 80 L95 80" />
                {/* Supporting Arm (Vertical under shoulder) */}
                <path d="M40 42 L40 75" />
                {/* Top Arm (Up or on Hip) */}
                {frame === 'mid'
                    ? <path d="M40 42 L30 20" /> // Arm Up
                    : <path d="M40 42 L50 35" /> // Arm on Hip
                }
            </svg>
        );
    }

    if (pose === 'cobra') {
        // Prone, Chest Up.
        const rise = frame === 'mid' ? 40 : 10;
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Legs (Flat) */}
                <path d="M40 85 L90 85" />
                {/* Torso (Arched up) */}
                <path d={`M40 85 L30 ${85 - rise}`} />
                {/* Head */}
                <circle cx="25" cy={85 - rise - 10} r="8" />
                {/* Arms (Pushing) */}
                <path d={`M35 85 L35 ${85 - rise}`} />
            </svg>
        );
    }

    return null;
}
