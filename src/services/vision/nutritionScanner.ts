/**
 * Cal.AI Style Nutrition Scanner - Multi-Model (MoE) Pipeline
 * 
 * DEPRECATED: Single-model approach (gpt-4o-mini)
 * NEW: Strict 3-Step Chain of Thought Pipeline
 * 
 * Pipeline Flow:
 * 1. Barcode Detection (Packaged Foods) → OpenFoodFacts API → Fallback to Gemini
 * 2. Fresh Food Path: Molmo (Portion) → Gemini (Reasoning) → Qwen (Structuring)
 */

import { AI_CONFIG } from '@/config/aiConfig';
import { Html5Qrcode } from 'html5-qrcode';

export interface FoodPrediction {
    food_name: string;
    portion_detected: string;
    calories: number;
    macros: {
        p: number;  // protein in grams
        c: number;  // carbs in grams
        f: number;  // fat in grams
    };
    confidence_score: number;
    source?: 'barcode' | 'openfoodfacts' | 'moe_pipeline';
    description?: string;
    // Legacy compatibility fields
    className?: string;  // Alias for food_name
    probability?: number;  // Alias for confidence_score
}

interface OpenFoodFactsResponse {
    product?: {
        product_name?: string;
        nutriments?: {
            energy_kcal_100g?: number;
            proteins_100g?: number;
            carbohydrates_100g?: number;
            fat_100g?: number;
        };
        quantity?: string;
    };
    status: number;
}

class NutritionScanner {
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    }

    /**
     * Main entry point - scans food from camera or file
     */
    async scanFromCamera(videoElement: HTMLVideoElement): Promise<FoodPrediction | null> {
        const imageUrl = this.captureFrame(videoElement);
        return this.scanFood(imageUrl);
    }

    async scanFromFile(file: File): Promise<FoodPrediction | null> {
        const imageUrl = await this.fileToBase64(file);
        return this.scanFood(imageUrl);
    }

    /**
     * The Master Orchestrator - Implements the complete MoE pipeline
     */
    async scanFood(imageUrl: string): Promise<FoodPrediction | null> {
        try {
            if (!this.apiKey) {
                console.error("NutritionScanner: No OpenRouter API Key found.");
                throw new Error("API Key Missing");
            }

            console.log("⚡️ [Scanner] Starting Cal.AI Style Pipeline...");

            // STEP A: Barcode Detection (The "Packaged" Path)
            const barcodeResult = await this.detectBarcode(imageUrl);
            if (barcodeResult) {
                console.log("✅ [Scanner] Barcode detected:", barcodeResult);
                
                // Try OpenFoodFacts API first
                const openFoodFactsResult = await this.queryOpenFoodFacts(barcodeResult);
                if (openFoodFactsResult) {
                    console.log("✅ [Scanner] OpenFoodFacts success");
                    return openFoodFactsResult;
                }

                // Fallback: Use Gemini to extract from package label
                console.log("⚠️ [Scanner] OpenFoodFacts failed, using Gemini for label extraction");
                const geminiResult = await this.extractFromLabel(imageUrl, barcodeResult);
                if (geminiResult) {
                    return geminiResult;
                }
            }

            // STEP B: The "Fresh Food" Path (The MoE Chain)
            console.log("🌿 [Scanner] No barcode detected, running Fresh Food MoE Pipeline...");
            return await this.runMoEPipeline(imageUrl);

        } catch (error) {
            console.error("NutritionScanner Pipeline Failed:", error);
            return null;
        }
    }

    /**
     * STEP A.1: Detect Barcode in Image
     */
    private async detectBarcode(imageUrl: string): Promise<string | null> {
        try {
            // Convert data URL to File/Blob for html5-qrcode
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });

            // Create a temporary container for the scanner
            const tempContainer = document.createElement('div');
            tempContainer.id = 'temp-barcode-scanner';
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '-9999px';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);

            const html5QrCode = new Html5Qrcode("temp-barcode-scanner");
            
            // Try to scan for barcodes (EAN, UPC, etc.)
            const result = await html5QrCode.scanFile(file, false);
            
            // Clean up
            await html5QrCode.clear();
            document.body.removeChild(tempContainer);
            
            // Check if result looks like a barcode (numeric, 8-13 digits)
            if (result && /^\d{8,13}$/.test(result)) {
                return result;
            }
            
            return null;
        } catch (error) {
            // No barcode found or scanner error - this is expected for fresh food
            // Clean up temp container if it exists
            const tempContainer = document.getElementById('temp-barcode-scanner');
            if (tempContainer) {
                document.body.removeChild(tempContainer);
            }
            return null;
        }
    }

    /**
     * STEP A.2: Query OpenFoodFacts API
     */
    private async queryOpenFoodFacts(barcode: string): Promise<FoodPrediction | null> {
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data: OpenFoodFactsResponse = await response.json();

            if (data.status === 1 && data.product) {
                const product = data.product;
                const nutriments = product.nutriments || {};
                
                // Calculate per serving (assume 100g if quantity not specified)
                const quantity = product.quantity || '100g';
                const quantityMatch = quantity.match(/(\d+(?:\.\d+)?)\s*g/i);
                const grams = quantityMatch ? parseFloat(quantityMatch[1]) : 100;
                const multiplier = grams / 100;

                return {
                    food_name: product.product_name || 'Unknown Product',
                    portion_detected: quantity,
                    calories: Math.round((nutriments.energy_kcal_100g || 0) * multiplier),
                    macros: {
                        p: Math.round((nutriments.proteins_100g || 0) * multiplier * 10) / 10,
                        c: Math.round((nutriments.carbohydrates_100g || 0) * multiplier * 10) / 10,
                        f: Math.round((nutriments.fat_100g || 0) * multiplier * 10) / 10,
                    },
                    confidence_score: 0.95,
                    source: 'openfoodfacts',
                };
            }
            return null;
        } catch (error) {
            console.warn("OpenFoodFacts API error:", error);
            return null;
        }
    }

    /**
     * STEP A.3: Fallback - Extract nutrition from package label using Gemini
     */
    private async extractFromLabel(imageUrl: string, barcode: string): Promise<FoodPrediction | null> {
        const prompt = `Extract nutrition facts from this package label with barcode ${barcode}. 
Return ONLY valid JSON (no markdown):
{
  "food_name": "string",
  "portion_detected": "string (e.g. '100g', '1 serving')",
  "calories": number,
  "macros": {
    "p": number (protein in grams),
    "c": number (carbs in grams),
    "f": number (fat in grams)
  }
}`;

        try {
            const result = await this.callOpenRouter(
                AI_CONFIG.MODELS.REASONING,
                prompt,
                imageUrl
            );

            const parsed = this.parseJson(result);
            return {
                food_name: parsed.food_name || 'Unknown Product',
                portion_detected: parsed.portion_detected || 'Unknown',
                calories: parsed.calories || 0,
                macros: {
                    p: parsed.macros?.p || 0,
                    c: parsed.macros?.c || 0,
                    f: parsed.macros?.f || 0,
                },
                confidence_score: 0.85,
                source: 'barcode',
                className: parsed.food_name || 'Unknown Product',
                probability: 0.85,
            };
        } catch (error) {
            console.error("Gemini label extraction failed:", error);
            return null;
        }
    }

    /**
     * STEP B: The Fresh Food MoE Pipeline (3-Step Chain)
     */
    private async runMoEPipeline(imageUrl: string): Promise<FoodPrediction | null> {
        try {
            // Step 1: Molmo - Volumetric Analysis
            console.log("📐 [Scanner] Step 1: Molmo (Portion Estimation)...");
            let portionDescription: string;
            
            try {
                const molmoPrompt = `Analyze this image pixel-by-pixel. Describe the VOLUMETRIC portion size of the food in grams or cups. Be precise about spatial dimensions. 
Example outputs: "Approximately 1.5 cups of rice", "About 200g of chicken breast", "Roughly 150ml of soup".
Return ONLY the portion description, no other text.`;

                portionDescription = await this.callOpenRouter(
                    AI_CONFIG.MODELS.PORTION,
                    molmoPrompt,
                    imageUrl
                );
                console.log("   → Portion:", portionDescription);
            } catch (molmoError) {
                console.warn("⚠️ [Scanner] Molmo failed, falling back to Gemini for portion estimation");
                // Fallback: Use Gemini for portion estimation
                const fallbackPrompt = `Estimate the portion size of the food in this image. Describe it in grams or cups. Be precise.`;
                portionDescription = await this.callOpenRouter(
                    AI_CONFIG.MODELS.REASONING,
                    fallbackPrompt,
                    imageUrl
                );
            }

            // Step 2: Gemini - Identification & Nutritional Reasoning
            console.log("🧠 [Scanner] Step 2: Gemini (Food ID & Macro Calculation)...");
            const geminiPrompt = `Identify the food in this image. Using the portion size provided ('${portionDescription}'), calculate the exact macros (Calories, Protein, Carbs, Fat). Reason deeply about ingredients and cooking methods.
Provide a detailed analysis with specific numbers.`;

            const geminiAnalysis = await this.callOpenRouter(
                AI_CONFIG.MODELS.REASONING,
                geminiPrompt,
                imageUrl
            );
            console.log("   → Analysis:", geminiAnalysis.substring(0, 100) + "...");

            // Step 3: Qwen - JSON Structuring
            console.log("📋 [Scanner] Step 3: Qwen (JSON Extraction)...");
            const qwenPrompt = `Extract the data from this analysis into this exact JSON schema:
{
  "food_name": "string",
  "portion_detected": "string",
  "calories": number,
  "macros": {
    "p": number (protein in grams),
    "c": number (carbs in grams),
    "f": number (fat in grams)
  },
  "confidence_score": number (0-1)
}

Analysis text: ${geminiAnalysis}

Return ONLY valid JSON. No markdown, no explanations.`;

            const qwenResult = await this.callOpenRouter(
                AI_CONFIG.MODELS.STRUCTURING,
                qwenPrompt
            );
            console.log("   → Structured:", qwenResult.substring(0, 100) + "...");

            const parsed = this.parseJson(qwenResult);
            
            return {
                food_name: parsed.food_name || 'Unknown Food',
                portion_detected: parsed.portion_detected || portionDescription,
                calories: parsed.calories || 0,
                macros: {
                    p: parsed.macros?.p || 0,
                    c: parsed.macros?.c || 0,
                    f: parsed.macros?.f || 0,
                },
                confidence_score: parsed.confidence_score || 0.8,
                source: 'moe_pipeline',
                description: portionDescription,
                className: parsed.food_name || 'Unknown Food',
                probability: parsed.confidence_score || 0.8,
            };

        } catch (error) {
            console.error("MoE Pipeline Failed:", error);
            return null;
        }
    }

    /**
     * Recalculate macros when user edits food name or portion
     */
    async recalculateMacros(foodName: string, portion: string): Promise<{ macros: FoodPrediction['macros'], calories: number } | null> {
        try {
            const prompt = `Given this food: "${foodName}" with portion: "${portion}", calculate the exact macros and total calories.
Return ONLY valid JSON:
{
  "calories": number (total calories for the specified portion),
  "macros": {
    "p": number (protein in grams),
    "c": number (carbs in grams),
    "f": number (fat in grams)
  }
}`;

            const result = await this.callOpenRouter(
                AI_CONFIG.MODELS.REASONING,
                prompt
            );

            const parsed = this.parseJson(result);
            if (parsed.macros && parsed.calories !== undefined) {
                return {
                    macros: parsed.macros,
                    calories: parsed.calories
                };
            }
            return null;
        } catch (error) {
            console.error("Recalculation failed:", error);
            return null;
        }
    }

    // --- Helper: OpenRouter API Call ---
    private async callOpenRouter(model: string, prompt: string, imageBase64?: string): Promise<string> {
        const url = `${AI_CONFIG.BASE_URL}/chat/completions`;
        const headers = AI_CONFIG.HEADERS(this.apiKey);

        // Standard OpenAI format supported by OpenRouter
        const messages: any[] = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    ...(imageBase64 ? [{ type: 'image_url', image_url: { url: imageBase64 } }] : [])
                ]
            }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.2, // Low temp for factual analysis
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter Error (${model}): ${err}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    // --- Utilities ---

    private captureFrame(video: HTMLVideoElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.7);
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    private parseJson(text: string): any {
        try {
            // Remove markdown code blocks if present
            let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Find JSON object boundaries
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) {
                clean = clean.substring(start, end);
            }
            
            return JSON.parse(clean);
        } catch (e) {
            console.warn("JSON Parse failed, returning fallback", e);
            return {
                food_name: 'Unknown Food',
                portion_detected: 'Unknown',
                calories: 0,
                macros: { p: 0, c: 0, f: 0 },
                confidence_score: 0
            };
        }
    }

    // Legacy method stub for compatibility
    isModelLoaded(): boolean {
        return true;
    }
}

export const nutritionScanner = new NutritionScanner();
