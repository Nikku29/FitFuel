import React from 'react';

type PoseType = 'horizontal_prone' | 'standing_squat' | 'standing_press' | 'seated_row' | 'vertical_hang' | undefined;

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
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="20" cy={yOffset} r="8" />
                <path d={`M28 ${yOffset} L80 ${yOffset} L80 ${yOffset + 5}`} /> {/* Body + Feet */}
                <path d={`M35 ${yOffset} L35 ${yOffset + 15}`} /> {/* Arms */}
            </svg>
        );
    }

    if (pose === 'standing_squat') {
        const squatDepth = frame === 'mid' ? 20 : 0;
        return (
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy={30 - pullHeight} r="8" />
                <path d={`M50 ${38 - pullHeight} L50 ${70 - pullHeight}`} />
                <path d={`M50 ${70 - pullHeight} L40 ${90 - pullHeight} M50 ${70 - pullHeight} L60 ${90 - pullHeight}`} />
                {/* Arms Hanging/Pulling */}
                <path d={`M50 ${40 - pullHeight} L20 10 M50 ${40 - pullHeight} L80 10`} />
            </svg>
        );
    }

    return null;
}
