// ============================================================================
// Database Seeder (Supabase implementation)
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

const sampleRecipes = [
    // VEGAN
    {
        title: 'Quinoa Buddha Bowl', calories: 450,
        dietary_type: 'vegan', category: 'lunch', tags: ['Vegan', 'Gluten-Free', 'High-Protein'],
        ingredients: ['Quinoa', 'Chickpeas', 'Kale', 'Avocado', 'Tahini'],
        steps: ['Cook quinoa', 'Roast chickpeas', 'Assemble bowl'],
        nutrition_facts: { protein: 18, carbs: 55, fat: 12 }
    },
    {
        title: 'Lentil Shepherd\u2019s Pie', calories: 500,
        dietary_type: 'vegan', category: 'dinner', tags: ['Vegan', 'Gluten-Free'],
        ingredients: ['Lentils', 'Carrots', 'Peas', 'Mashed Potatoes', 'Vegetable Broth'],
        steps: ['Cook lentils', 'Top with mash', 'Bake 20 mins'],
        nutrition_facts: { protein: 22, carbs: 60, fat: 8 }
    },
    {
        title: 'Spicy Tofu Stir Fry', calories: 400,
        dietary_type: 'vegan', category: 'dinner', tags: ['Vegan', 'High-Protein'],
        ingredients: ['Tofu', 'Broccoli', 'Soy Sauce', 'Chili Paste', 'Rice'],
        steps: ['Press tofu', 'Fry tofu', 'Add veggies and sauce'],
        nutrition_facts: { protein: 20, carbs: 45, fat: 15 }
    },
    // KETO
    {
        title: 'Avocado Chicken Salad', calories: 380,
        dietary_type: 'non-vegetarian', category: 'lunch', tags: ['Keto', 'High-Fat', 'Gluten-Free'],
        ingredients: ['Chicken Breast', 'Avocado', 'Olive Oil', 'Spinach', 'Walnuts'],
        steps: ['Grill chicken', 'Mix with avocado', 'Serve on spinach'],
        nutrition_facts: { protein: 35, carbs: 6, fat: 28 }
    },
    {
        title: 'Garlic Butter Salmon', calories: 450,
        dietary_type: 'non-vegetarian', category: 'dinner', tags: ['Keto', 'Pescatarian'],
        ingredients: ['Salmon', 'Butter', 'Garlic', 'Asparagus'],
        steps: ['Pan sear salmon in butter', 'Sauté asparagus'],
        nutrition_facts: { protein: 30, carbs: 4, fat: 32 }
    },
    // VEGETARIAN
    {
        title: 'Paneer Tikka Masala', calories: 400,
        dietary_type: 'vegetarian', category: 'dinner', tags: ['Vegetarian', 'Indian', 'High-Protein'],
        ingredients: ['Paneer', 'Tomato Sauce', 'Cream', 'Indian Spices', 'Bell Peppers'],
        steps: ['Marinate paneer', 'Cook sauce', 'Simmer together'],
        nutrition_facts: { protein: 25, carbs: 15, fat: 25 }
    },
    {
        title: 'Spinach and Feta Stuffed Peppers', calories: 320,
        dietary_type: 'vegetarian', category: 'lunch', tags: ['Vegetarian', 'Low-Carb'],
        ingredients: ['Bell Peppers', 'Spinach', 'Feta Cheese', 'Garlic', 'Olive Oil'],
        steps: ['Hollow peppers', 'Stuff with spinach mix', 'Bake 30 mins'],
        nutrition_facts: { protein: 12, carbs: 10, fat: 20 }
    },
    // PALEO
    {
        title: 'Sweet Potato Beef Chili', calories: 550,
        dietary_type: 'non-vegetarian', category: 'dinner', tags: ['Paleo', 'Gluten-Free'],
        ingredients: ['Ground Beef', 'Sweet Potato', 'Peppers', 'Onion', 'Chili Powder'],
        steps: ['Brown beef', 'Add veggies', 'Simmer 30 mins'],
        nutrition_facts: { protein: 40, carbs: 35, fat: 20 }
    }
];

export const seedDatabase = async () => {
    console.log('\ud83c\udf31 Starting Seed Process...');

    try {
        // Insert recipes using Supabase
        const { data, error } = await supabase
            .from('recipes')
            .upsert(sampleRecipes.map(r => ({
                ...r,
                source: 'seeded'
            })), { onConflict: 'title' });

        if (error) {
            // If upsert with onConflict fails (no unique constraint on title), try insert
            console.warn('Upsert failed, trying insert:', error.message);
            const { error: insertError } = await supabase
                .from('recipes')
                .insert(sampleRecipes.map(r => ({
                    ...r,
                    source: 'seeded'
                })));

            if (insertError) throw insertError;
        }

        console.log(`\ud83c\udf89 Database Population Complete!`);
        console.log(`   Total Recipes: ${sampleRecipes.length}`);
    } catch (error) {
        console.error("\u274c Error seeding database:", error);
        throw error;
    }
};

// Run directly only when executed as a script
// @ts-expect-error: process checking for Node.js environment execution
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('seedDatabase')) {
    seedDatabase();
}