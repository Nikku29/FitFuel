export interface Recipe {
    id: string;
    title: string;
    description: string;
    prepTime: string;
    calories: number;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan';
    tags: string[];
    ingredients: string[];
    steps: string[];
    nutritionFacts: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
}

export const STATIC_RECIPES: Recipe[] = [
    // BREAKFAST - VEG
    {
        id: 'static-bf-1',
        title: 'Oatmeal with Berries',
        description: 'A classic healthy breakfast rich in fiber and antioxidants.',
        prepTime: '10 mins',
        calories: 300,
        category: 'breakfast',
        dietaryType: 'vegetarian',
        tags: ['High Fiber', 'Quick'],
        ingredients: ['Oats', 'Milk', 'Berries', 'Honey'],
        steps: ['Boil milk', 'Add oats', 'Cook for 5 mins', 'Top with berries'],
        nutritionFacts: { protein: 10, carbs: 50, fat: 5, fiber: 8 }
    },
    {
        id: 'static-bf-2',
        title: 'Avocado Toast',
        description: 'Creamy avocado on whole grain toast.',
        prepTime: '5 mins',
        calories: 350,
        category: 'breakfast',
        dietaryType: 'vegan',
        tags: ['Healthy Fats', 'Quick'],
        ingredients: ['Bread', 'Avocado', 'Salt', 'Pepper'],
        steps: ['Toast bread', 'Mash avocado', 'Spread on toast', 'Season'],
        nutritionFacts: { protein: 8, carbs: 40, fat: 15, fiber: 10 }
    },
    // LUNCH - NON-VEG
    {
        id: 'static-ln-1',
        title: 'Grilled Chicken Salad',
        description: 'Lean protein with fresh vegetables.',
        prepTime: '20 mins',
        calories: 400,
        category: 'lunch',
        dietaryType: 'non-vegetarian',
        tags: ['High Protein', 'Low Carb'],
        ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Cucumber'],
        steps: ['Grill chicken', 'Chop veggies', 'Mix together', 'Add dressing'],
        nutritionFacts: { protein: 40, carbs: 10, fat: 15, fiber: 5 }
    },
    // DINNER - VEGAN
    {
        id: 'static-dn-1',
        title: 'Lentil Soup',
        description: 'Hearty and nutritious soup perfect for dinner.',
        prepTime: '30 mins',
        calories: 350,
        category: 'dinner',
        dietaryType: 'vegan',
        tags: ['High Protein', 'Comfort Food'],
        ingredients: ['Lentils', 'Carrots', 'Onions', 'Spices'],
        steps: ['Sauté veggies', 'Add lentils and water', 'Simmer until soft'],
        nutritionFacts: { protein: 18, carbs: 50, fat: 5, fiber: 15 }
    }
    // Add more as needed...
];
