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
    // --- BREAKFAST ---
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
        ingredients: ['Bread', 'Avocado', 'Salt', 'Black Pepper', 'Lemon Juice'],
        steps: ['Toast bread', 'Mash avocado with lemon juice', 'Spread on toast', 'Season'],
        nutritionFacts: { protein: 8, carbs: 40, fat: 15, fiber: 10 }
    },
    {
        id: 'static-bf-3',
        title: 'Keto Egg Bites',
        description: 'High protein, low carb breakfast bites.',
        prepTime: '20 mins',
        calories: 250,
        category: 'breakfast',
        dietaryType: 'non-vegetarian',
        tags: ['Keto', 'High Protein', 'Low Carb'],
        ingredients: ['Eggs', 'Cheese', 'Spinach', 'Bacon Bits'],
        steps: ['Whisk eggs', 'Mix in cheese and spinach', 'Pour into muffin tin', 'Bake at 350F for 15 mins'],
        nutritionFacts: { protein: 20, carbs: 2, fat: 18, fiber: 1 }
    },
    {
        id: 'static-bf-4',
        title: 'Tofu Scramble',
        description: 'A vegan alternative to scrambled eggs, packed with protein.',
        prepTime: '15 mins',
        calories: 280,
        category: 'breakfast',
        dietaryType: 'vegan',
        tags: ['High Protein', 'Vegan', 'Gluten-Free'],
        ingredients: ['Tofu', 'Turmeric', 'Onion', 'Bell Pepper', 'Spinach'],
        steps: ['Crumble tofu', 'Sauté veggies', 'Add tofu and turmeric', 'Cook for 5 mins'],
        nutritionFacts: { protein: 22, carbs: 12, fat: 14, fiber: 5 }
    },
    
    // --- LUNCH ---
    {
        id: 'static-ln-1',
        title: 'Grilled Chicken Salad',
        description: 'Lean protein with fresh crisp vegetables.',
        prepTime: '20 mins',
        calories: 400,
        category: 'lunch',
        dietaryType: 'non-vegetarian',
        tags: ['High Protein', 'Low Carb', 'Dairy-Free'],
        ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive Oil'],
        steps: ['Grill chicken', 'Chop veggies', 'Mix together', 'Drizzle olive oil'],
        nutritionFacts: { protein: 40, carbs: 10, fat: 15, fiber: 5 }
    },
    {
        id: 'static-ln-2',
        title: 'Quinoa Buddha Bowl',
        description: 'A well-rounded vegan lunch bowl.',
        prepTime: '25 mins',
        calories: 450,
        category: 'lunch',
        dietaryType: 'vegan',
        tags: ['High Fiber', 'Vegan', 'Gluten-Free'],
        ingredients: ['Quinoa', 'Chickpeas', 'Sweet Potato', 'Kale', 'Tahini'],
        steps: ['Cook quinoa', 'Roast sweet potato', 'Massage kale', 'Assemble bowl and top with tahini'],
        nutritionFacts: { protein: 15, carbs: 65, fat: 12, fiber: 14 }
    },
    {
        id: 'static-ln-3',
        title: 'Turkey Wrap',
        description: 'A quick and easy high-protein lunch.',
        prepTime: '5 mins',
        calories: 320,
        category: 'lunch',
        dietaryType: 'non-vegetarian',
        tags: ['High Protein', 'Quick'],
        ingredients: ['Whole Wheat Wrap', 'Turkey Slices', 'Spinach', 'Hummus'],
        steps: ['Spread hummus on wrap', 'Add turkey and spinach', 'Roll tightly'],
        nutritionFacts: { protein: 25, carbs: 30, fat: 10, fiber: 6 }
    },
    {
        id: 'static-ln-4',
        title: 'Paneer Tikka Salad',
        description: 'A flavorful vegetarian lunch options rich in Indian spices.',
        prepTime: '20 mins',
        calories: 380,
        category: 'lunch',
        dietaryType: 'vegetarian',
        tags: ['High Protein', 'Vegetarian', 'Keto-Friendly'],
        ingredients: ['Paneer', 'Bell Peppers', 'Onion', 'Yogurt', 'Tikka Masala'],
        steps: ['Marinate paneer and veggies in yogurt and spices', 'Grill or pan fry', 'Serve over greens'],
        nutritionFacts: { protein: 20, carbs: 15, fat: 25, fiber: 4 }
    },

    // --- DINNER ---
    {
        id: 'static-dn-1',
        title: 'Lentil Soup',
        description: 'Hearty and nutritious soup perfect for a comforting dinner.',
        prepTime: '30 mins',
        calories: 350,
        category: 'dinner',
        dietaryType: 'vegan',
        tags: ['High Protein', 'Comfort Food', 'Vegan'],
        ingredients: ['Lentils', 'Carrots', 'Onions', 'Vegetable Broth', 'Spices'],
        steps: ['Sauté veggies', 'Add lentils and broth', 'Simmer until soft', 'Blend slightly if desired'],
        nutritionFacts: { protein: 18, carbs: 50, fat: 5, fiber: 15 }
    },
    {
        id: 'static-dn-2',
        title: 'Baked Salmon with Asparagus',
        description: 'Rich in omega-3s and elegant for dinner.',
        prepTime: '25 mins',
        calories: 420,
        category: 'dinner',
        dietaryType: 'non-vegetarian',
        tags: ['High Protein', 'Pescatarian', 'Keto', 'Paleo'],
        ingredients: ['Salmon Fillet', 'Asparagus', 'Lemon', 'Olive Oil', 'Garlic'],
        steps: ['Preheat oven to 400F', 'Place salmon and asparagus on pan', 'Season and bake for 15 mins'],
        nutritionFacts: { protein: 35, carbs: 5, fat: 28, fiber: 3 }
    },
    {
        id: 'static-dn-3',
        title: 'Zucchini Noodles with Meatballs',
        description: 'A low-carb twist on classic spaghetti.',
        prepTime: '30 mins',
        calories: 380,
        category: 'dinner',
        dietaryType: 'non-vegetarian',
        tags: ['Low Carb', 'Keto', 'Paleo'],
        ingredients: ['Zucchini', 'Ground Beef', 'Tomato Sauce', 'Onion', 'Garlic'],
        steps: ['Spiralize zucchini', 'Form and cook meatballs', 'Simmer in sauce', 'Serve over raw or lightly sautéed zoodles'],
        nutritionFacts: { protein: 30, carbs: 15, fat: 22, fiber: 4 }
    },
    {
        id: 'static-dn-4',
        title: 'Chickpea Curry',
        description: 'A warm, spiced, plant-based dinner.',
        prepTime: '25 mins',
        calories: 400,
        category: 'dinner',
        dietaryType: 'vegan',
        tags: ['Vegan', 'Gluten-Free', 'High Fiber'],
        ingredients: ['Chickpeas', 'Coconut Milk', 'Tomato Paste', 'Curry Powder', 'Spinach'],
        steps: ['Simmer tomatoes and coconut milk', 'Add spices and chickpeas', 'Stir in spinach until wilted'],
        nutritionFacts: { protein: 12, carbs: 45, fat: 18, fiber: 10 }
    },

    // --- SNACKS ---
    {
        id: 'static-sn-1',
        title: 'Apple with Almond Butter',
        description: 'A crunchy, sweet, and satisfying snack.',
        prepTime: '2 mins',
        calories: 200,
        category: 'snack',
        dietaryType: 'vegan',
        tags: ['Quick', 'Vegan', 'Paleo'],
        ingredients: ['Apple', 'Almond Butter'],
        steps: ['Slice apple', 'Dip in almond butter'],
        nutritionFacts: { protein: 5, carbs: 25, fat: 10, fiber: 5 }
    },
    {
        id: 'static-sn-2',
        title: 'Greek Yogurt with Walnuts',
        description: 'High protein snack perfect for post-workout.',
        prepTime: '2 mins',
        calories: 220,
        category: 'snack',
        dietaryType: 'vegetarian',
        tags: ['High Protein', 'Vegetarian'],
        ingredients: ['Greek Yogurt', 'Walnuts', 'Honey'],
        steps: ['Scoop yogurt', 'Top with crushed walnuts and drizzle of honey'],
        nutritionFacts: { protein: 15, carbs: 12, fat: 12, fiber: 2 }
    },
    {
        id: 'static-sn-3',
        title: 'Hard-Boiled Eggs',
        description: 'The ultimate portable protein snack.',
        prepTime: '12 mins',
        calories: 140,
        category: 'snack',
        dietaryType: 'non-vegetarian',
        tags: ['High Protein', 'Keto', 'Quick'],
        ingredients: ['Eggs', 'Salt', 'Black Pepper'],
        steps: ['Boil eggs for 10 mins', 'Cool in ice water', 'Peel and season'],
        nutritionFacts: { protein: 12, carbs: 1, fat: 10, fiber: 0 }
    },
    {
        id: 'static-sn-4',
        title: 'Edamame',
        description: 'Simple, salty, plant-based protein.',
        prepTime: '5 mins',
        calories: 120,
        category: 'snack',
        dietaryType: 'vegan',
        tags: ['High Protein', 'Vegan', 'Low Carb'],
        ingredients: ['Edamame Pods', 'Sea Salt'],
        steps: ['Steam edamame', 'Sprinkle with coarse sea salt'],
        nutritionFacts: { protein: 11, carbs: 9, fat: 5, fiber: 5 }
    }
];
