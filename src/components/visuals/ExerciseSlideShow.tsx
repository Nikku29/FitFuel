import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProceduralPose } from './ProceduralPose';

type PoseType = 'horizontal_prone' | 'standing_squat' | 'standing_press' | 'seated_row' | 'vertical_hang' | 'seated_twist' | 'supine_leg_lift' | 'side_plank' | 'cobra';

const FRAMES: ('start' | 'mid' | 'end')[] = ['start', 'mid', 'end'];
const INTERVAL_MS = 1400;

interface ExerciseSlideShowProps {
    pose: PoseType;
    isIsometric?: boolean;
    color?: string;
    className?: string;
}

/**
 * Slide-style animation: cycles through start -> mid -> end like a mini demo.
 * Use during active work phase so each exercise has a distinct animated visual.
 */
export const ExerciseSlideShow: React.FC<ExerciseSlideShowProps> = ({
    pose,
    isIsometric = false,
    color = '#1e293b',
    className = ''
}) => {
    const [idx, setIdx] = useState(0);
    const frame = isIsometric ? 'mid' : FRAMES[idx];

    useEffect(() => {
        if (isIsometric) return;
        const t = setInterval(() => {
            setIdx((i) => (i + 1) % FRAMES.length);
        }, INTERVAL_MS);
        return () => clearInterval(t);
    }, [isIsometric]);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={frame}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-center w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gray-50 border-2 border-purple-200 shadow-inner"
                >
                    <ProceduralPose pose={pose} frame={frame} color={color} />
                </motion.div>
            </AnimatePresence>
            {!isIsometric && (
                <span className="text-xs font-mono text-gray-500 mt-2 uppercase tracking-wider">
                    {frame}
                </span>
            )}
            {isIsometric && (
                <span className="text-xs font-mono text-blue-500 mt-2">HOLD</span>
            )}
        </div>
    );
};
