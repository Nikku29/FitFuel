
import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Image as ImageIcon, X, Upload, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface FoodCameraProps {
    onCapture: (imageSrc: string) => void;
    onCancel: () => void;
}

const FoodCamera: React.FC<FoodCameraProps> = ({ onCapture, onCancel }) => {
    const webcamRef = useRef<Webcam>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
        } else {
            toast.error('Failed to capture image');
        }
    }, [webcamRef, onCapture]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                onCapture(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full">
            <div className="relative w-full aspect-[3/4] max-w-md bg-black rounded-lg overflow-hidden shadow-xl">
                {!isCameraActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 text-white p-6">
                        <Camera className="w-16 h-16 opacity-50" />
                        <p className="text-center text-sm opacity-80">
                            Take a photo of your meal to analyze calories and macros instantly.
                        </p>
                        <div className="flex gap-4 mt-4">
                            <Button
                                onClick={() => setIsCameraActive(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Camera className="mr-2 h-4 w-4" /> Start Camera
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload Photo
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode: facingMode
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Camera Overlay Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={() => setIsCameraActive(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>

                            <Button
                                size="icon"
                                className="h-16 w-16 rounded-full bg-white hover:bg-white/90 border-4 border-white/50"
                                onClick={capture}
                            >
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-black/10"></div>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={toggleCamera}
                            >
                                <FlipHorizontal className="h-6 w-6" />
                            </Button>
                        </div>
                    </>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </div>

            <p className="text-xs text-slate-500 max-w-md text-center">
                FitFuel AI analyzes your food to estimate nutritional content. Results may vary.
            </p>
        </div>
    );
};

export default FoodCamera;
