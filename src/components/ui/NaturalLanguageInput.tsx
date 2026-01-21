import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Search, Loader2, X } from 'lucide-react';
import { nutritionScanner, FoodPrediction } from '@/services/vision/nutritionScanner';
import { toast } from '@/hooks/use-toast';

interface NaturalLanguageInputProps {
    onSearch: (query: string) => void;
    onFoodScan?: (prediction: FoodPrediction) => void;
    placeholder?: string;
    type?: 'workout' | 'recipe';
    isLoading?: boolean;
}

const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
    onSearch,
    onFoodScan,
    placeholder = '✨ Describe what you want (e.g., "High protein breakfast")',
    type = 'recipe',
    isLoading = false
}) => {
    const [query, setQuery] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
            setQuery('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsCameraOpen(true);
        } catch (error) {
            console.error('Failed to start camera:', error);
            toast({
                title: 'Camera Error',
                description: 'Could not access camera. Please check permissions.',
                variant: 'destructive'
            });
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        setIsScanning(false);
    };

    const captureAndScan = async () => {
        if (!videoRef.current || !onFoodScan) return;

        setIsScanning(true);
        try {
            // Load model if not already loaded
            if (!nutritionScanner.isModelLoaded()) {
                await nutritionScanner.loadModel();
            }

            // Scan from video feed
            const prediction = await nutritionScanner.scanFromCamera(videoRef.current);

            if (prediction) {
                onFoodScan(prediction);
                toast({
                    title: 'Food Detected!',
                    description: `${prediction.className} - Est. ${prediction.estimatedCalories} kcal`,
                });
                stopCamera();
            } else {
                toast({
                    title: 'No Food Detected',
                    description: 'Try adjusting the camera angle or lighting.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Scanning error:', error);
            toast({
                title: 'Scan Failed',
                description: 'Could not classify image. Try again.',
                variant: 'destructive'
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="pr-10 h-12 text-base border-2 border-purple-200 focus:border-purple-500"
                        disabled={isLoading}
                    />
                    <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearch}
                    disabled={!query.trim() || isLoading}
                    className="h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate'
                    )}
                </Button>

                {/* Camera Button (only for recipe/food type) */}
                {type === 'recipe' && onFoodScan && (
                    <Button
                        onClick={startCamera}
                        variant="outline"
                        className="h-12 px-4 border-2 border-purple-200 hover:bg-purple-50"
                    >
                        <Camera className="h-5 w-5 text-purple-600" />
                    </Button>
                )}
            </div>

            {/* Camera Modal */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Scan Food</h3>
                            <Button variant="ghost" size="sm" onClick={stopCamera}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Video Preview */}
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />

                            {/* Scanning Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-white text-center">
                                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                                        <p>Analyzing food...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={captureAndScan}
                                disabled={isScanning}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Capture & Analyze
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={stopCamera}>
                                Cancel
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Position food clearly in frame for best results
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NaturalLanguageInput;
