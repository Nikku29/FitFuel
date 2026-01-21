import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Camera, Barcode, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Types for dynamically loaded libraries
type MobileNetType = { load: () => Promise<any> };
type TfType = { ready: () => Promise<void> };

interface FoodCameraProps {
    onCapture: (data: { type: 'barcode' | 'vision', value: string, confidence?: number }) => void;
    onClose: () => void;
}

const FoodCamera: React.FC<FoodCameraProps> = ({ onCapture, onClose }) => {
    const [mode, setMode] = useState<'barcode' | 'vision'>('vision');
    const [model, setModel] = useState<any>(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [predictions, setPredictions] = useState<{ className: string; probability: number }[]>([]);
    const [loadProgress, setLoadProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<any>(null); // Type 'any' for lazy-loaded scanner

    // 1. Lazy Load TensorFlow MobileNet Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log("Lazy Loading TensorFlow...");
                setIsModelLoading(true);
                setLoadProgress(10);

                const tf = await import('@tensorflow/tfjs') as unknown as TfType;
                setLoadProgress(40);
                await tf.ready();
                setLoadProgress(60);

                const mobilenet = await import('@tensorflow-models/mobilenet') as unknown as MobileNetType;
                setLoadProgress(80);

                const loadedModel = await mobilenet.load();
                setLoadProgress(100);

                setModel(loadedModel);
                setIsModelLoading(false);
                console.log("MobileNet Loaded!");
            } catch (err) {
                console.error("Failed to load TensorFlow model", err);
                setIsModelLoading(false);
            }
        };

        if (mode === 'vision' && !model) loadModel();
        else if (mode === 'vision' && model) setIsModelLoading(false);

    }, [mode, model]);

    // 2. Vision Mode: Real-time Classification Loop
    useEffect(() => {
        let animationId: number;
        let isActive = true;

        const classifyFrame = async () => {
            if (!isActive) return;
            if (model && videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const preds = await model.classify(videoRef.current);
                    if (isActive) setPredictions(preds.slice(0, 2)); // Top 2
                } catch (e) {
                    // ignore transient frame errors
                }
            }
            animationId = requestAnimationFrame(classifyFrame);
        };

        if (mode === 'vision' && !isModelLoading && model) {
            startCamera();
            classifyFrame();
        }

        return () => {
            isActive = false;
            cancelAnimationFrame(animationId);
        };
    }, [mode, model, isModelLoading]);

    // 3. Barcode Mode: HTML5-QRCode (Lazy Loaded)
    useEffect(() => {
        let isMounted = true;

        if (mode === 'barcode') {
            const initScanner = async () => {
                // Dynamic Import
                const { Html5QrcodeScanner } = await import('html5-qrcode');

                if (!isMounted) return;

                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        false
                    );

                    scanner.render((decodedText) => {
                        if (navigator.vibrate) navigator.vibrate(50); // HAPTIC FEEDBACK
                        scanner.clear();
                        onCapture({ type: 'barcode', value: decodedText });
                    }, (err) => {
                        // ignore scanning errors
                    });
                    scannerRef.current = scanner;
                }
            };

            // Small delay to ensure DOM is ready
            setTimeout(initScanner, 100);
        }

        return () => {
            isMounted = false;
            if (scannerRef.current) {
                try { scannerRef.current.clear().catch(console.error); } catch (e) { }
                scannerRef.current = null;
            }
        };
    }, [mode, onCapture]);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(e => console.error("Play error:", e));
                    };
                }
            } catch (e) {
                console.error("Camera access denied:", e);
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const handleVisionCapture = () => {
        if (predictions.length > 0) {
            onCapture({ type: 'vision', value: predictions[0].className, confidence: predictions[0].probability });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">

            {/* Header / Close */}
            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" className="text-white bg-black/50 rounded-full h-10 w-10 p-0 hover:bg-black/70" onClick={onClose}>
                    <X size={24} />
                </Button>
            </div>

            <div className="mb-6 text-white font-bold text-xl uppercase tracking-widest flex items-center gap-2">
                {mode === 'vision' ? <><Sparkles className="w-5 h-5 text-purple-400" /> AI Vision</> : <><Barcode className="w-5 h-5 text-green-400" /> Scanner</>}
            </div>

            {/* Camera Viewport */}
            <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">

                {mode === 'vision' && (
                    <>
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                        />

                        {/* Laser Scan Animation (Themed Purple) */}
                        {!isModelLoading && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="w-full h-0.5 bg-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.8)] absolute top-0 animate-scan-laser"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-30 animate-scan-pulse"></div>
                            </div>
                        )}

                        {/* Predictions Overlay */}
                        {predictions.length > 0 && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12 space-y-3">
                                {predictions.map((p, i) => (
                                    <div key={i} className={cn(
                                        "flex justify-between items-center text-white px-4 py-3 rounded-xl backdrop-blur-md transition-all duration-300",
                                        i === 0 ? "bg-white/20 border border-white/30 shadow-lg scale-105" : "bg-black/40 border border-white/10"
                                    )}>
                                        <span className="font-semibold capitalize text-lg tracking-wide">{p.className}</span>
                                        <span className={cn("font-bold", p.probability > 0.8 ? "text-green-400" : "text-yellow-400")}>
                                            {Math.round(p.probability * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Loading State */}
                        {isModelLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-8">
                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                                <div className="text-white font-semibold mb-2">Initializing Neural Net</div>
                                <Progress value={loadProgress} className="w-full h-2 bg-gray-800" indicatorClassName="bg-purple-500" />
                                <p className="text-xs text-gray-500 mt-2">Downloading MobileNet (~4MB)</p>
                            </div>
                        )}
                    </>
                )}

                {mode === 'barcode' && (
                    <div id="reader" className="w-full h-full text-white bg-black"></div>
                )}

            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center space-x-8">
                <Button
                    variant={mode === 'barcode' ? "default" : "outline"}
                    className={cn("rounded-full h-14 w-14 p-0 border-2 transition-all duration-300", mode === 'barcode' ? "bg-white text-black border-white scale-110" : "text-white border-white/20 bg-transparent hover:bg-white/10")}
                    onClick={() => setMode('barcode')}
                >
                    <Barcode size={24} />
                </Button>

                <button
                    onClick={mode === 'vision' ? handleVisionCapture : () => { }}
                    className={cn(
                        "h-24 w-24 rounded-full border-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative group",
                        mode === 'vision' ? "border-purple-500" : "border-white"
                    )}
                >
                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300",
                        mode === 'vision' ? "bg-gradient-to-br from-purple-500 to-indigo-600 group-hover:from-purple-400 group-hover:to-indigo-500" : "bg-white group-hover:bg-gray-200"
                    )}>
                        {mode === 'vision' ? <Camera className="text-white" size={40} /> : <div className="text-xs text-black font-black tracking-tighter">SCAN</div>}
                    </div>
                </button>

                <Button
                    variant={mode === 'vision' ? "default" : "outline"}
                    className={cn("rounded-full h-14 w-14 p-0 border-2 transition-all duration-300", mode === 'vision' ? "bg-white text-black border-white scale-110" : "text-white border-white/20 bg-transparent hover:bg-white/10")}
                    onClick={() => setMode('vision')}
                >
                    <Camera size={24} />
                </Button>
            </div>

            <div className="mt-6 text-white/50 text-sm max-w-xs text-center font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                {mode === 'vision' ? "Point at food for Instant AI Analysis" : "Align barcode within the frame"}
            </div>

            <style>{`
                @keyframes scan-laser {
                    0% { top: 0; box-shadow: 0 0 15px rgba(168,85,247,0.8); }
                    50% { top: 100%; box-shadow: 0 0 15px rgba(168,85,247,0.8); }
                    100% { top: 0; box-shadow: 0 0 15px rgba(168,85,247,0.8); }
                }
                @keyframes scan-pulse {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.1; }
                }
                .animate-scan-laser {
                    animation: scan-laser 2s linear infinite;
                }
                .animate-scan-pulse {
                    animation: scan-pulse 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default FoodCamera;
