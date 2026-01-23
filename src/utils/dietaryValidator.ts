import { UserData } from '@/contexts/UserContextTypes';

export interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    dietaryType: string;
    tags: string[];
    [key: string]: any;
}

// STRICT BANNED INGREDIENT LISTS
const BANNED_INGREDIENTS = {
    Vegan: ['chicken', 'beef', 'pork', 'fish', 'tuna', 'salmon', 'shrimp', 'egg', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'honey', 'whey', 'ghee', 'gelatin', 'meat'],
    // Vegetarian (Standard Lacto-Ovo) - Bans meat/fish
    Vegetarian: ['chicken', 'beef', 'pork', 'fish', 'tuna', 'salmon', 'shrimp', 'lamb', 'meat', 'steak', 'bacon', 'ham', 'sausage'],
    // Veg (Indian Context / Lacto-Vegetarian) - Bans meat/fish AND EGGS
    Veg: ['chicken', 'beef', 'pork', 'fish', 'tuna', 'salmon', 'shrimp', 'lamb', 'meat', 'steak', 'bacon', 'ham', 'sausage', 'egg', 'eggs'],
    // Eggetarian - Bans meat/fish, allows eggs
    Eggetarian: ['chicken', 'beef', 'pork', 'fish', 'tuna', 'salmon', 'shrimp', 'lamb', 'meat', 'steak', 'bacon', 'ham', 'sausage'],
    'Gluten-Free': ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'couscous', 'seitan', 'soy sauce', 'beer', 'malt'],
    Keto: ['sugar', 'rice', 'pasta', 'bread', 'potato', 'corn', 'beans', 'lentils', 'banana', 'apple', 'grape', 'honey', 'syrup', 'flour', 'oats'],
    Paleo: ['sugar', 'dairy', 'cheese', 'milk', 'cream', 'butter', 'grains', 'oats', 'wheat', 'rice', 'corn', 'beans', 'lentils', 'soy', 'peanut']
};

export const validateRecipe = (user: UserData | null, recipe: Recipe): { valid: boolean; reason?: string } => {
    if (!user || !user.dietaryPreference) return { valid: true }; // No restrictions for guests

    const diet = user.dietaryPreference;
    const ingredients = recipe.ingredients.map(i => i.toLowerCase());
    const title = recipe.title.toLowerCase();

    // 1. Check Banned Ingredients
    if (Object.prototype.hasOwnProperty.call(BANNED_INGREDIENTS, diet)) {
        const forbidden = BANNED_INGREDIENTS[diet as keyof typeof BANNED_INGREDIENTS];
        const violations = forbidden.filter(banned => {
            // Check title
            if (title.includes(banned)) return true;
            // Check ingredients (full word match preferred to avoid partials like 'eggplant' matching 'egg')
            return ingredients.some(i => {
                const words = i.split(/[\s,]+/);
                return words.includes(banned) || i.includes(` ${banned} `) || i === banned || i.startsWith(`${banned} `) || i.endsWith(` ${banned}`);
            });
        });

        if (violations.length > 0) {
            console.error(`🚨 DIETARY VIOLATION: ${diet} user served ${violations.join(', ')}`);
            return { valid: false, reason: `Contains ${violations[0]}` };
        }
    }

    // 2. Strict Type Check (Metadata)
    // Vegan Strict
    if (diet === 'Vegan' && recipe.dietaryType !== 'vegan') return { valid: false, reason: 'Not marked as Vegan' };

    // Veg/Vegetarian Strict: Ban 'non-vegetarian' type
    if ((diet === 'Veg' || diet === 'Vegetarian' || diet === 'Eggetarian') && recipe.dietaryType === 'non-vegetarian') {
        return { valid: false, reason: 'Marked as Non-Veg' };
    }

    return { valid: true };
};

export const getStrictSystemPrompt = (user: UserData) => {
    const diet = user.dietaryPreference || 'General';
    const restrictions = diet in BANNED_INGREDIENTS
        ? BANNED_INGREDIENTS[diet as keyof typeof BANNED_INGREDIENTS].join(', ')
        : 'None';

    return `
    CRITICAL INSTRUCTION: You are a strict nutritionist.
    USER DIET: ${diet}
    FORBIDDEN INGREDIENTS: ${restrictions}
    
    RULES:
    1. If user is Vegetarian/Vegan, DO NOT suggest meat substitutes unless explicitly asked.
    2. If user is Keto, keep carbs < 10g.
    3. Return STRICT JSON only.
  `;
};
