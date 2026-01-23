import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { firebaseConfig } from '../integrations/firebase/config';



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. DATASET ---
// (We keep your data but ensure the script handles it safely)
const sampleRecipes = [
    // VEGAN
    {
        id: 'vegan-1', title: 'Quinoa Buddha Bowl', calories: 450,
        dietaryType: 'vegan', category: 'lunch', tags: ['Vegan', 'Gluten-Free', 'High-Protein'],
        ingredients: ['Quinoa', 'Chickpeas', 'Kale', 'Avocado', 'Tahini'],
        steps: ['Cook quinoa', 'Roast chickpeas', 'Assemble bowl'],
        nutritionFacts: { protein: 18, carbs: 55, fat: 12 }
    },
    {
        id: 'vegan-2', title: 'Lentil Shepherd’s Pie', calories: 500,
        dietaryType: 'vegan', category: 'dinner', tags: ['Vegan', 'Gluten-Free'],
        ingredients: ['Lentils', 'Carrots', 'Peas', 'Mashed Potatoes', 'Vegetable Broth'],
        steps: ['Cook lentils', 'Top with mash', 'Bake 20 mins'],
        nutritionFacts: { protein: 22, carbs: 60, fat: 8 }
    },
    {
        id: 'vegan-3', title: 'Spicy Tofu Stir Fry', calories: 400,
        dietaryType: 'vegan', category: 'dinner', tags: ['Vegan', 'High-Protein'],
        ingredients: ['Tofu', 'Broccoli', 'Soy Sauce', 'Chili Paste', 'Rice'],
        steps: ['Press tofu', 'Fry tofu', 'Add veggies and sauce'],
        nutritionFacts: { protein: 20, carbs: 45, fat: 15 }
    },
    // KETO
    {
        id: 'keto-1', title: 'Avocado Chicken Salad', calories: 380,
        dietaryType: 'non-vegetarian', category: 'lunch', tags: ['Keto', 'High-Fat', 'Gluten-Free'],
        ingredients: ['Chicken Breast', 'Avocado', 'Olive Oil', 'Spinach', 'Walnuts'],
        steps: ['Grill chicken', 'Mix with avocado', 'Serve on spinach'],
        nutritionFacts: { protein: 35, carbs: 6, fat: 28 }
    },
    {
        id: 'keto-2', title: 'Garlic Butter Salmon', calories: 450,
        dietaryType: 'non-vegetarian', category: 'dinner', tags: ['Keto', 'Pescatarian'],
        ingredients: ['Salmon', 'Butter', 'Garlic', 'Asparagus'],
        steps: ['Pan sear salmon in butter', 'Sauté asparagus'],
        nutritionFacts: { protein: 30, carbs: 4, fat: 32 }
    },
    // VEGETARIAN
    {
        id: 'veg-1', title: 'Paneer Tikka Masala', calories: 400,
        dietaryType: 'vegetarian', category: 'dinner', tags: ['Vegetarian', 'Indian', 'High-Protein'],
        ingredients: ['Paneer', 'Tomato Sauce', 'Cream', 'Indian Spices', 'Bell Peppers'],
        steps: ['Marinate paneer', 'Cook sauce', 'Simmer together'],
        nutritionFacts: { protein: 25, carbs: 15, fat: 25 }
    },
    {
        id: 'veg-2', title: 'Spinach and Feta Stuffed Peppers', calories: 320,
        dietaryType: 'vegetarian', category: 'lunch', tags: ['Vegetarian', 'Low-Carb'],
        ingredients: ['Bell Peppers', 'Spinach', 'Feta Cheese', 'Garlic', 'Olive Oil'],
        steps: ['Hollow peppers', 'Stuff with spinach mix', 'Bake 30 mins'],
        nutritionFacts: { protein: 12, carbs: 10, fat: 20 }
    },
    // PALEO
    {
        id: 'paleo-1', title: 'Sweet Potato Beef Chili', calories: 550,
        dietaryType: 'non-vegetarian', category: 'dinner', tags: ['Paleo', 'Gluten-Free'],
        ingredients: ['Ground Beef', 'Sweet Potato', 'Peppers', 'Onion', 'Chili Powder'],
        steps: ['Brown beef', 'Add veggies', 'Simmer 30 mins'],
        nutritionFacts: { protein: 40, carbs: 35, fat: 20 }
    }
];

const sampleWorkouts = [
    {
        title: 'HIIT Blast',
        difficulty: 'Advanced',
        category: 'Cardio',
        exercises: [{ name: 'Burpees', reps: '20' }, { name: 'Mountain Climbers', reps: '40' }]
    },
    {
        title: 'Morning Yoga Flow',
        difficulty: 'Beginner',
        category: 'Yoga',
        exercises: [{ name: 'Sun Salutation', duration: '5 min' }, { name: 'Warrior I', duration: '2 min' }]
    },
    {
        title: 'Full Body Strength',
        difficulty: 'Intermediate',
        category: 'Strength',
        exercises: [{ name: 'Squats', reps: '15' }, { name: 'Pushups', reps: '12' }]
    }
];

// --- 3. SEEDING FUNCTION (SAFE BATCHING) ---
// --- 3. SEEDING FUNCTION (SAFE BATCHING) ---
export const seedDatabase = async () => {
    console.log('🌱 Starting Seed Process...');

    // We use a helper function to commit in chunks
    const commitBatch = async (items: any[], collectionName: string) => {
        const CHUNK_SIZE = 450; // Safety margin below 500
        let count = 0;

        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db); // Create a NEW batch for every chunk

            chunk.forEach(item => {
                const ref = doc(collection(db, collectionName)); // Auto-ID
                batch.set(ref, item);
            });

            await batch.commit(); // Commit this chunk
            count += chunk.length;
            console.log(`   ✅ Committed ${chunk.length} items to ${collectionName}`);
        }
        return count;
    };

    try {
        const recipeCount = await commitBatch(sampleRecipes, 'recipes');
        const workoutCount = await commitBatch(sampleWorkouts, 'workouts');

        console.log('🎉 Database Population Complete!');
        console.log(`   Total Recipes: ${recipeCount}`);
        console.log(`   Total Workouts: ${workoutCount}`);

        // Only exit if running in Node.js environment
        if (typeof process !== 'undefined') {
            // @ts-ignore
            process.exit(0);
        }
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        if (typeof process !== 'undefined') {
            // @ts-ignore
            process.exit(1);
        }
    }
};

// Run directly only when executed as a script (not when imported)
// @ts-ignore - process check for Node.js environment
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('seedDatabase')) {
    seedDatabase();
}