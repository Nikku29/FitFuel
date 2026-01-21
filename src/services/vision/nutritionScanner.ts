/**
 * Nutrition Scanner - TensorFlow.js image classification for food recognition
 * Uses MobileNet for client-side image classification
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface FoodPrediction {
    className: string;
    probability: number;
    estimatedCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

class NutritionScanner {
    private model: mobilenet.MobileNet | null = null;
    private isLoading: boolean = false;

    /**
     * Load the MobileNet model
     */
    async loadModel(): Promise<void> {
        if (this.model || this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('Loading MobileNet model...');
            this.model = await mobilenet.load();
            console.log('MobileNet model loaded successfully');
        } catch (error) {
            console.error('Failed to load MobileNet model:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Classify an image and return food predictions
     */
    async classifyImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<FoodPrediction[]> {
        if (!this.model) {
            await this.loadModel();
        }

        if (!this.model) {
            throw new Error('Model failed to load');
        }

        try {
            // Get predictions from MobileNet
            const predictions = await this.model.classify(imageElement);

            // Map predictions to food data with estimated nutrition
            return predictions.map(pred => ({
                className: pred.className,
                probability: pred.probability,
                ...this.estimateNutrition(pred.className)
            }));
        } catch (error) {
            console.error('Classification error:', error);
            throw error;
        }
    }

    /**
     * Estimate nutrition from food class name
     * This is a simplified mapping - in production, you'd use a nutrition database API
     */
    private estimateNutrition(className: string): { estimatedCalories: number; macros: { protein: number; carbs: number; fat: number } } {
        const lowerClass = className.toLowerCase();

        // Simple keyword-based estimation
        const nutritionMap: Record<string, { estimatedCalories: number; macros: { protein: number; carbs: number; fat: number } }> = {
            // Fruits
            'banana': { estimatedCalories: 105, macros: { protein: 1, carbs: 27, fat: 0 } },
            'apple': { estimatedCalories: 95, macros: { protein: 0, carbs: 25, fat: 0 } },
            'orange': { estimatedCalories: 62, macros: { protein: 1, carbs: 15, fat: 0 } },

            // Vegetables
            'broccoli': { estimatedCalories: 55, macros: { protein: 4, carbs: 11, fat: 0 } },
            'cucumber': { estimatedCalories: 16, macros: { protein: 1, carbs: 4, fat: 0 } },

            // Proteins
            'chicken': { estimatedCalories: 165, macros: { protein: 31, carbs: 0, fat: 4 } },
            'salmon': { estimatedCalories: 206, macros: { protein: 22, carbs: 0, fat: 13 } },
            'egg': { estimatedCalories: 78, macros: { protein: 6, carbs: 1, fat: 5 } },

            // Grains/Carbs
            'bread': { estimatedCalories: 265, macros: { protein: 9, carbs: 49, fat: 3 } },
            'rice': { estimatedCalories: 206, macros: { protein: 4, carbs: 45, fat: 0 } },
            'pasta': { estimatedCalories: 158, macros: { protein: 6, carbs: 31, fat: 1 } },

            // Default
            'default': { estimatedCalories: 200, macros: { protein: 10, carbs: 30, fat: 5 } }
        };

        // Find best match
        for (const [key, value] of Object.entries(nutritionMap)) {
            if (lowerClass.includes(key)) {
                return value;
            }
        }

        return nutritionMap.default;
    }

    /**
     * Process camera image and return top prediction
     */
    async scanFromCamera(videoElement: HTMLVideoElement): Promise<FoodPrediction | null> {
        const predictions = await this.classifyImage(videoElement);
        return predictions.length > 0 ? predictions[0] : null;
    }

    /**
     * Process uploaded image file
     */
    async scanFromFile(file: File): Promise<FoodPrediction | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        const predictions = await this.classifyImage(img);
                        resolve(predictions.length > 0 ? predictions[0] : null);
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Check if model is loaded
     */
    isModelLoaded(): boolean {
        return this.model !== null;
    }
}

export const nutritionScanner = new NutritionScanner();
