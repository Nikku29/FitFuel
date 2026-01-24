import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { visualAssetService } from '@/services/VisualAssetService';
import { Skeleton } from '@/components/ui/skeleton';
import { ProceduralPose } from '@/components/visuals/ProceduralPose';

interface InstructionalSpriteProps {
    exerciseName: string;
    category?: string;
    phase: 'rest' | 'prep' | 'work';
}

export const InstructionalSprite: React.FC<InstructionalSpriteProps> = ({
    exerciseName,
    category = 'general',
    phase
}) => {
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadAsset = async () => {
            setLoading(true);
            try {
                const data = await visualAssetService.getAssetForExercise(exerciseName, category);
                if (mounted) setAsset(data);
            } catch (err) {
                console.error("Failed to load sprite", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadAsset();
        return () => { mounted = false; };
    }, [exerciseName, category]);

    if (loading) return <Skeleton className="w-full h-48 rounded-xl" />;
    if (!asset) return null;

    // PROCEDURAL ENGINE RENDERING
    if (asset.source === 'generated' && asset.id.startsWith('procedural')) {
        const poseName = asset.id.replace('procedural-', '');

        if (phase === 'work') return null; // Hide in work phase

        if (phase === 'prep') {
            return (
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-xl border-4 border-yellow-400">
                    <div className="w-32 h-32 animate-pulse">
                        <ProceduralPose pose={poseName} frame="start" color="#eab308" />
                    </div>
                </div>
            );
        }

        // Rest Phase: Comic Strip
        return (
            <div className="flex items-center justify-center gap-4 w-full h-48">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 border rounded-lg bg-white p-2">
                        <ProceduralPose pose={poseName} frame="start" />
                    </div>
                    <span className="text-xs font-mono mt-1">START</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 border rounded-lg bg-white p-2">
                        <ProceduralPose pose={poseName} frame="mid" />
                    </div>
                    <span className="text-xs font-mono mt-1">ACTION</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 border rounded-lg bg-white p-2">
                        <ProceduralPose pose={poseName} frame="end" />
                    </div>
                    <span className="text-xs font-mono mt-1">END</span>
                </div>
            </div>
        );
    }
    if (phase === 'work') {
        return (
            <motion.div
                className="flex items-center justify-center opacity-50 contrast-50 grayscale transition-all duration-1000"
                initial={{ scale: 1 }}
                animate={{ scale: 0.8 }}
            >
                <img src={asset.urls.end} alt="Exercise Target" className="h-32 w-auto object-contain" />
            </motion.div>
        );
    }

    // PREP PHASE: Pulsing "Get Ready"
    if (phase === 'prep') {
        return (
            <div className="flex justify-center items-center gap-4">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="relative"
                >
                    <img src={asset.urls.start} alt="Start Position" className="h-48 w-auto object-contain border-4 border-yellow-400 rounded-lg p-1 bg-yellow-50" />
                    <div className="absolute -top-3 -right-3 bg-yellow-500 text-white font-bold px-2 py-1 rounded-full text-xs animate-bounce">
                        START
                    </div>
                </motion.div>
                <div className="text-gray-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
                <img src={asset.urls.end} alt="End Position" className="h-48 w-auto object-contain opacity-60" />
            </div>
        );
    }

    // REST PHASE: Full "Comic Strip" (Start -> Mid -> End)
    return (
        <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 p-4 bg-white/50 rounded-2xl border border-dashed border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Panel 1: Start */}
            <div className="flex flex-col items-center">
                <img src={asset.urls.start} alt="Start" className="h-32 md:h-40 w-auto object-contain" />
                <span className="text-xs text-gray-500 font-mono mt-2">START</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-gray-300">
                →
            </div>

            {/* Panel 2: End */}
            <div className="flex flex-col items-center">
                <img src={asset.urls.end} alt="End" className="h-32 md:h-40 w-auto object-contain" />
                <span className="text-xs text-gray-500 font-mono mt-2">FINISH</span>
            </div>

            {/* Mid (if available) - Optional Pro Feature */}
            {asset.urls.mid && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <img src={asset.urls.mid} alt="Motion" className="h-full w-auto object-contain" />
                </div>
            )}
        </motion.div>
    );
};
