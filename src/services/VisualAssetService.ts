import { getExerciseTag, isDefaultTag } from '@/data/exerciseTags';
import {
  AI_CONFIG,
  OPENROUTER_BASE,
  MODEL_IMAGE_GEN,
  OPENROUTER_HEADERS,
} from '@/config/aiConfig';

interface VisualAsset {
  id: string;
  exerciseName: string;
  category?: string;
  urls: {
    start: string;
    mid?: string;
    end: string;
  };
  source: 'local' | 'firestore' | 'generated';
}

// No local assets - 100% AI-generated self-building database

const PROCEDURAL_POSES = [
  'horizontal_prone',
  'standing_squat',
  'standing_press',
  'seated_row',
  'vertical_hang',
  'seated_twist',
  'supine_leg_lift',
  'side_plank',
  'cobra',
] as const;

class VisualAssetService {
  private cache: Map<string, VisualAsset> = new Map();
  private imageGenCache: Map<string, string> = new Map();
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    try {
      const saved = localStorage.getItem('fitfuel_asset_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.values(parsed).forEach((asset: any) =>
          this.cache.set((asset.exerciseName || '').toLowerCase(), asset)
        );
      }
      const imgCache = localStorage.getItem('fitfuel_image_gen_cache');
      if (imgCache) {
        const obj = JSON.parse(imgCache);
        Object.entries(obj).forEach(([k, v]) => this.imageGenCache.set(k, v as string));
      }
    } catch (e) {
      console.warn('Failed to load asset cache', e);
    }
  }

  async generateVisual(prompt: string): Promise<string> {
    const cacheKey = prompt.slice(0, 120);
    if (this.imageGenCache.has(cacheKey)) {
      return this.imageGenCache.get(cacheKey)!;
    }
    if (!this.apiKey) {
      console.warn('VisualAssetService: No OpenRouter API key. Please set VITE_OPENROUTER_API_KEY.');
      throw new Error('OpenRouter API key required for visual generation');
    }

    const url = `${AI_CONFIG.BASE_URL}/chat/completions`;
    const headers = AI_CONFIG.HEADERS(this.apiKey);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: AI_CONFIG.MODELS.VISUAL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter image gen ${res.status}: ${text}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (data.error?.message) throw new Error(data.error.message);
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) throw new Error('Empty image gen response.');

      let imageUrl = '';
      const urlMatch = content.match(/https?:\/\/[^\s)\]"]+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      } else if (/^data:image\//i.test(content.trim())) {
        imageUrl = content.trim();
      } else {
        imageUrl = content.trim();
      }

      if (imageUrl) {
        this.imageGenCache.set(cacheKey, imageUrl);
        try {
          const obj: Record<string, string> = {};
          this.imageGenCache.forEach((v, k) => (obj[k] = v));
          localStorage.setItem('fitfuel_image_gen_cache', JSON.stringify(obj));
        } catch (e) {
          console.warn('Image gen cache persist failed', e);
        }
      }

      return imageUrl || '';
    } catch (e) {
      console.error('generateVisual failed:', e);
      throw new Error(`Visual generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  private buildImagePrompt(exerciseName: string): string {
    const tag = getExerciseTag(exerciseName);
    const equipment = tag.equipment === 'none' ? 'NO equipment' : tag.equipment;
    const view = tag.view;
    return `Create a technical, sequential line-art diagram for "${exerciseName}".

STYLE LOCK: Technical Line Art / Vector Diagram
- Style: Blue/Grey vectors, white background, labeled where necessary
- Technical diagram aesthetic: Clean lines, instructional clarity
- NO photorealism, NO shadows, NO gradients, NO complex textures
- Think: Technical manual, exercise guide, anatomical diagram

Requirements:
- ONE image only. Include ALL required positions/steps in that single image.
- Use a multi-panel or grid layout: 2 panels for 2 main positions (e.g. twist left, twist right), or up to 6–10 panels for a flow/sequence.
- Each panel = one distinct pose. Clear, minimal, easy to follow.
- View: ${view}. Equipment: ${equipment}.
- Labels are acceptable for clarity (e.g., "Start", "End", "Hold").
- Output ONLY a valid image URL (https://...) or a data URL (data:image/...) for the generated image. No other text.`;
  }

  async getAssetForExercise(exerciseName: string, category: string = 'general'): Promise<VisualAsset> {
    const normalized = exerciseName.toLowerCase().trim();

    // Check cache first (self-building database)
    if (this.cache.has(normalized)) return this.cache.get(normalized)!;

    // Check for procedural pose generation (High-Fidelity Procedural SVGs)
    const tag = getExerciseTag(exerciseName);
    const useProcedural = !isDefaultTag(tag) && PROCEDURAL_POSES.includes(tag.pose as any);

    if (useProcedural) {
      const pose = tag.pose || 'standing_squat';
      const asset: VisualAsset = {
        id: `procedural-${pose}`,
        exerciseName,
        urls: { start: 'procedural:start', mid: 'procedural:mid', end: 'procedural:end' },
        source: 'generated',
      };
      this.addToCache(normalized, asset);
      return asset;
    }

    // Generate via AI (100% AI-generated, no local fallbacks)
    try {
      const prompt = this.buildImagePrompt(exerciseName);
      const imageUrl = await this.generateVisual(prompt);
      const asset: VisualAsset = {
        id: `ai-${normalized}`,
        exerciseName,
        category,
        urls: { start: imageUrl, mid: imageUrl, end: imageUrl },
        source: 'generated',
      };
      this.addToCache(normalized, asset);
      return asset;
    } catch (error) {
      console.error(`Failed to generate visual for ${exerciseName}:`, error);
      // Return a placeholder that indicates generation is needed
      // The UI should show a "Generating..." loader
      throw new Error(`Visual generation required for "${exerciseName}". Please ensure VITE_OPENROUTER_API_KEY is set.`);
    }
  }

  private addToCache(key: string, asset: VisualAsset) {
    this.cache.set(key, asset);
    try {
      const currentObj: Record<string, VisualAsset> = {};
      this.cache.forEach((v, k) => (currentObj[k] = v));
      localStorage.setItem('fitfuel_asset_cache', JSON.stringify(currentObj));
    } catch (e) {
      console.warn('Cache quota exceeded');
    }
  }

  async cacheSessionAssets(exercises: any[]) {
    console.log('Pre-caching assets for session...');
    const promises = exercises.map((ex) => this.getAssetForExercise(ex.name, ex.category));
    await Promise.all(promises);
    console.log('Session assets cached.');
  }
}

export const visualAssetService = new VisualAssetService();
