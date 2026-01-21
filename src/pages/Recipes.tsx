
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Clock, Flame, Sparkles, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { aiService, PersonalizedRecipe } from '@/services/aiService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import FoodCamera from '@/components/calories/FoodCamera';
import { Camera } from 'lucide-react';
import NaturalLanguageInput from '@/components/ui/NaturalLanguageInput';
import { FoodPrediction } from '@/services/vision/nutritionScanner';

// Updated recipe data with new vegetarian and non-vegetarian recipes
const recipeData = [
  // Vegetarian Breakfast Recipes
  {
    id: 1,
    title: 'Muscle Moong Chilla Wrap',
    description: 'High-protein moong dal pancakes with paneer & veggies',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    prepTime: '20 mins',
    calories: 280,
    category: 'breakfast',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'indian', 'quick'],
    ingredients: ['Moong Dal', 'Paneer', 'Bell Peppers', 'Spinach', 'Indian Spices', 'Whole Wheat Wraps', 'Yogurt'],
    steps: [
      'Soak moong dal for 4-5 hours and grind to make a smooth batter.',
      'Add chopped spinach, spices, and salt to the batter.',
      'Heat a non-stick pan and pour a ladleful of batter to make a thin pancake.',
      'Cook until golden brown on both sides.',
      'Place the chilla on a wrap, add crumbled paneer and sautéed veggies.',
      'Roll up tightly and serve with yogurt dip.'
    ]
  },
  {
    id: 2,
    title: 'Oats Power Bowl',
    description: 'Overnight oats topped with fruits, nuts, chia & flax',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af',
    prepTime: '10 mins + overnight',
    calories: 320,
    category: 'breakfast',
    dietaryType: 'vegetarian',
    tags: ['fiber-rich', 'meal-prep', 'no-cook'],
    ingredients: ['Rolled Oats', 'Milk/Almond Milk', 'Chia Seeds', 'Flax Seeds', 'Mixed Berries', 'Banana', 'Almonds', 'Honey'],
    steps: [
      'Combine oats, milk, chia seeds, and flax seeds in a jar.',
      'Stir well and refrigerate overnight.',
      'In the morning, top with sliced fruits, nuts, and a drizzle of honey.',
      'Mix and enjoy your nutrient-dense breakfast.'
    ]
  },
  {
    id: 3,
    title: 'Tofu Protein Scramble',
    description: 'Spicy tofu chunks scrambled with bell peppers and turmeric',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
    prepTime: '15 mins',
    calories: 210,
    category: 'breakfast',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'vegan', 'low-calorie'],
    ingredients: ['Firm Tofu', 'Bell Peppers', 'Onions', 'Turmeric', 'Black Salt', 'Nutritional Yeast', 'Chilli Flakes', 'Olive Oil'],
    steps: [
      'Crumble the tofu with your hands into small pieces.',
      'Heat oil in a pan and sauté diced bell peppers and onions.',
      'Add crumbled tofu, turmeric, black salt, and spices.',
      'Cook for 5-7 minutes until the tofu is slightly browned.',
      'Sprinkle nutritional yeast for a cheesy flavor and serve hot.'
    ]
  },
  // Vegetarian Lunch Recipes
  {
    id: 4,
    title: 'Green Gains Buddha Bowl',
    description: 'Quinoa, avocado, chickpeas, and greens in a tahini dressing',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    prepTime: '25 mins',
    calories: 420,
    category: 'lunch',
    dietaryType: 'vegetarian',
    tags: ['nutrient-dense', 'meal-prep', 'vegan'],
    ingredients: ['Quinoa', 'Avocado', 'Chickpeas', 'Kale', 'Spinach', 'Cherry Tomatoes', 'Cucumber', 'Tahini', 'Lemon Juice', 'Sesame Seeds'],
    steps: [
      'Cook quinoa according to package instructions and let cool.',
      'Roast chickpeas with spices in the oven until crispy.',
      'Massage kale with a bit of olive oil and salt to soften.',
      'Mix tahini, lemon juice, and water to create a dressing.',
      'Arrange all ingredients in a bowl, top with sliced avocado and sesame seeds.',
      'Drizzle with tahini dressing and serve.'
    ]
  },
  {
    id: 5,
    title: 'High-Fiber Paneer Quinoa',
    description: 'Paneer cubes tossed with quinoa and broccoli',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
    prepTime: '30 mins',
    calories: 380,
    category: 'lunch',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'fiber-rich', 'nutrient-dense'],
    ingredients: ['Paneer', 'Quinoa', 'Broccoli', 'Bell Peppers', 'Onions', 'Indian Spices', 'Olive Oil', 'Lemon Juice'],
    steps: [
      'Cook quinoa and set aside to cool.',
      'Cut paneer into cubes and lightly pan-fry until golden.',
      'Steam broccoli until just tender but still crisp.',
      'Sauté diced bell peppers and onions with spices.',
      'Mix everything together with olive oil and lemon juice.',
      'Garnish with fresh coriander leaves and serve warm or cold.'
    ]
  },
  {
    id: 6,
    title: 'Lentil Lift Curry',
    description: 'Spiced dal with spinach served with brown rice',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    prepTime: '35 mins',
    calories: 340,
    category: 'lunch',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'iron-rich', 'comfort-food'],
    ingredients: ['Yellow Lentils', 'Spinach', 'Tomatoes', 'Onions', 'Ginger-Garlic Paste', 'Cumin Seeds', 'Turmeric', 'Brown Rice'],
    steps: [
      'Rinse lentils and cook with turmeric in a pressure cooker.',
      'In a separate pan, sauté cumin seeds, onions, and ginger-garlic paste.',
      'Add chopped tomatoes and cook until soft.',
      'Add the cooked lentils and simmer for 10 minutes.',
      'Stir in the chopped spinach and cook until wilted.',
      'Serve hot with brown rice.'
    ]
  },
  // Vegetarian Dinner Recipes
  {
    id: 7,
    title: 'Tofu Stir-Fry Supreme',
    description: 'Tofu sautéed with colorful veggies and sesame',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    prepTime: '25 mins',
    calories: 290,
    category: 'dinner',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'vegan', 'quick'],
    ingredients: ['Firm Tofu', 'Broccoli', 'Bell Peppers', 'Snow Peas', 'Carrots', 'Sesame Oil', 'Soy Sauce', 'Ginger', 'Garlic', 'Sesame Seeds'],
    steps: [
      'Press and drain tofu, then cut into cubes.',
      'Heat sesame oil in a wok and stir-fry tofu until golden.',
      'Remove tofu and add chopped vegetables to the wok.',
      'Add ginger and garlic, stir-fry until veggies are crisp-tender.',
      'Return tofu to the wok, add soy sauce, and toss everything together.',
      'Sprinkle with sesame seeds and serve hot.'
    ]
  },
  {
    id: 8,
    title: 'Veggie Protein Pasta',
    description: 'Chickpea pasta with a tomato-spinach-lentil sauce',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    prepTime: '35 mins',
    calories: 380,
    category: 'dinner',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'high-fiber', 'nutrient-dense'],
    ingredients: ['Chickpea Pasta', 'Red Lentils', 'Tomatoes', 'Spinach', 'Onions', 'Garlic', 'Italian Herbs', 'Nutritional Yeast'],
    steps: [
      'Cook chickpea pasta according to package instructions.',
      'In a separate pot, cook red lentils until soft.',
      'Sauté onions and garlic, then add chopped tomatoes.',
      'Add cooked lentils, Italian herbs, and simmer for 10 minutes.',
      'Stir in fresh spinach until wilted.',
      'Mix sauce with pasta and sprinkle nutritional yeast on top.'
    ]
  },
  {
    id: 9,
    title: 'Zucchini Noodle Zen Bowl',
    description: 'Spiralized zucchini tossed in light pesto & protein-rich seeds',
    image: 'https://images.unsplash.com/photo-1572453800999-e8d2d0a3cd5a',
    prepTime: '20 mins',
    calories: 250,
    category: 'dinner',
    dietaryType: 'vegetarian',
    tags: ['low-carb', 'keto-friendly', 'raw'],
    ingredients: ['Zucchini', 'Basil', 'Pine Nuts', 'Hemp Seeds', 'Cherry Tomatoes', 'Garlic', 'Olive Oil', 'Parmesan Cheese (optional)'],
    steps: [
      'Spiralize zucchini into noodles and pat dry with paper towels.',
      'Make pesto by blending basil, garlic, pine nuts, and olive oil.',
      'Halve cherry tomatoes and set aside.',
      'Toss zucchini noodles with pesto (no cooking required).',
      'Top with cherry tomatoes, hemp seeds, and Parmesan if using.',
      'Serve immediately for a light, refreshing dinner.'
    ]
  },
  // Vegetarian Snacks
  {
    id: 10,
    title: 'Protein-Packed Hummus & Carrot Sticks',
    description: 'Homemade protein-boosted hummus with fresh vegetable sticks',
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696',
    prepTime: '15 mins',
    calories: 180,
    category: 'snack',
    dietaryType: 'vegetarian',
    tags: ['high-protein', 'fiber-rich', 'vegan'],
    ingredients: ['Chickpeas', 'Tahini', 'Protein Powder (unflavored)', 'Garlic', 'Lemon Juice', 'Olive Oil', 'Carrots', 'Cucumber', 'Bell Peppers'],
    steps: [
      'Blend chickpeas, tahini, protein powder, garlic, lemon juice, and olive oil until smooth.',
      'Cut carrots, cucumber, and bell peppers into sticks.',
      'Serve hummus with vegetable sticks for dipping.',
      'Store leftover hummus in an airtight container in the refrigerator.'
    ]
  },
  {
    id: 11,
    title: 'Almond Energy Bites',
    description: 'Rolled oats, almond butter, dates, and chia',
    image: 'https://images.unsplash.com/photo-1582845512747-e42001c95638',
    prepTime: '15 mins + chilling',
    calories: 120,
    category: 'snack',
    dietaryType: 'vegetarian',
    tags: ['energy-boosting', 'no-bake', 'meal-prep'],
    ingredients: ['Rolled Oats', 'Almond Butter', 'Dates', 'Chia Seeds', 'Honey', 'Vanilla Extract', 'Dark Chocolate Chips (optional)'],
    steps: [
      'Blend dates until they form a paste.',
      'Mix with rolled oats, almond butter, chia seeds, honey, and vanilla extract.',
      'Fold in chocolate chips if using.',
      'Roll mixture into small balls.',
      'Refrigerate for at least 1 hour before eating.',
      'Store in an airtight container in the refrigerator.'
    ]
  },
  {
    id: 12,
    title: 'Greek Yogurt Fruit Pops',
    description: 'Frozen yogurt with berries and honey drizzle',
    image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7',
    prepTime: '10 mins + freezing',
    calories: 90,
    category: 'snack',
    dietaryType: 'vegetarian',
    tags: ['protein-rich', 'cooling', 'low-calorie'],
    ingredients: ['Greek Yogurt', 'Mixed Berries', 'Honey', 'Granola', 'Popsicle Molds'],
    steps: [
      'Mix Greek yogurt with a little honey.',
      'Layer yogurt and berries in popsicle molds.',
      'Add a sprinkle of granola on top.',
      'Insert popsicle sticks and freeze for at least 4 hours.',
      'Run molds under warm water to easily remove pops.'
    ]
  },
  // Non-Vegetarian Breakfast Recipes
  {
    id: 13,
    title: 'Egg White Muscle Muffins',
    description: 'Baked egg cups with spinach, chicken, and cheese',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
    prepTime: '25 mins',
    calories: 180,
    category: 'breakfast',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'meal-prep', 'low-carb'],
    ingredients: ['Egg Whites', 'Chicken Breast (cooked and shredded)', 'Spinach', 'Bell Peppers', 'Low-fat Cheese', 'Salt', 'Pepper', 'Olive Oil Spray'],
    steps: [
      'Preheat oven to 350°F (175°C) and spray a muffin tin with olive oil.',
      'Sauté spinach and bell peppers lightly.',
      'Mix egg whites with shredded chicken, sautéed vegetables, salt, and pepper.',
      'Pour mixture into muffin tins and sprinkle with cheese.',
      'Bake for 20 minutes until set and slightly golden.',
      'Let cool before removing from tin. Store extras in the refrigerator.'
    ]
  },
  {
    id: 14,
    title: 'Tuna Power Toast',
    description: 'Whole grain toast topped with tuna and avocado',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    prepTime: '10 mins',
    calories: 270,
    category: 'breakfast',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'omega-3', 'quick'],
    ingredients: ['Whole Grain Bread', 'Canned Tuna (in water)', 'Avocado', 'Lemon Juice', 'Red Onion', 'Cherry Tomatoes', 'Olive Oil', 'Black Pepper'],
    steps: [
      'Toast whole grain bread slices.',
      'Drain tuna and mix with a touch of olive oil and lemon juice.',
      'Mash avocado and spread on toast.',
      'Top with tuna mixture, diced red onion, and halved cherry tomatoes.',
      'Season with black pepper and serve immediately.'
    ]
  },
  {
    id: 15,
    title: 'Chicken Sausage Protein Skillet',
    description: 'Lean sausage sauté with peppers & eggs',
    image: 'https://images.unsplash.com/photo-1606851094291-6efae152bb87',
    prepTime: '20 mins',
    calories: 320,
    category: 'breakfast',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'low-carb', 'one-pan'],
    ingredients: ['Lean Chicken Sausage', 'Bell Peppers', 'Onions', 'Eggs', 'Spinach', 'Olive Oil', 'Italian Herbs', 'Red Pepper Flakes'],
    steps: [
      'Slice chicken sausage and sauté in olive oil until browned.',
      'Add sliced bell peppers and onions, cooking until softened.',
      'Create wells in the mixture and crack eggs into them.',
      'Cover and cook until eggs reach desired doneness.',
      'Add spinach and cover until wilted.',
      'Season with herbs, red pepper flakes, and serve hot.'
    ]
  },
  // Non-Vegetarian Lunch Recipes
  {
    id: 16,
    title: 'Grilled Chicken Quinoa Bowl',
    description: 'Chicken, quinoa, kale, and sweet potato',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71',
    prepTime: '35 mins',
    calories: 430,
    category: 'lunch',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'nutrient-dense', 'meal-prep'],
    ingredients: ['Chicken Breast', 'Quinoa', 'Kale', 'Sweet Potato', 'Olive Oil', 'Lemon Juice', 'Garlic', 'Mixed Herbs'],
    steps: [
      'Season chicken breast with herbs and grill until cooked through.',
      'Cook quinoa according to package instructions.',
      'Roast sweet potato cubes in the oven with olive oil until tender.',
      'Massage kale with olive oil and lemon juice to soften.',
      'Slice cooked chicken and assemble all components in a bowl.',
      'Drizzle with additional lemon juice and olive oil if desired.'
    ]
  },
  {
    id: 17,
    title: 'Egg-Celent Protein Curry',
    description: 'Boiled eggs in a light coconut curry sauce',
    image: 'https://images.unsplash.com/photo-1599789197514-47270cd526b4',
    prepTime: '25 mins',
    calories: 310,
    category: 'lunch',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'nutrient-dense', 'comfort-food'],
    ingredients: ['Eggs', 'Light Coconut Milk', 'Tomatoes', 'Onions', 'Garlic', 'Ginger', 'Curry Powder', 'Spinach', 'Brown Rice'],
    steps: [
      'Hard boil eggs, cool, peel, and set aside.',
      'Sauté onions, garlic, and ginger until fragrant.',
      'Add tomatoes and curry powder, cooking until tomatoes break down.',
      'Pour in coconut milk and simmer for 5 minutes.',
      'Add spinach and stir until wilted.',
      'Cut eggs in half and add to the curry.',
      'Serve with brown rice.'
    ]
  },
  {
    id: 18,
    title: 'Turkey Meatball Meal Prep Box',
    description: 'Lean turkey meatballs, brown rice, and greens',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    prepTime: '40 mins',
    calories: 390,
    category: 'lunch',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'meal-prep', 'low-fat'],
    ingredients: ['Ground Turkey', 'Brown Rice', 'Mixed Greens', 'Egg', 'Oats', 'Garlic', 'Onion', 'Italian Herbs', 'Olive Oil'],
    steps: [
      'Mix ground turkey with finely chopped onion, garlic, oats, egg, and herbs.',
      'Form into small meatballs and bake until cooked through.',
      'Cook brown rice according to package instructions.',
      'Steam or sauté mixed greens with a little olive oil.',
      'Portion meatballs, rice, and greens into meal prep containers.',
      'Refrigerate for up to 3 days or freeze for longer storage.'
    ]
  },
  // Non-Vegetarian Dinner Recipes
  {
    id: 19,
    title: 'Salmon Fit Plate',
    description: 'Grilled salmon, asparagus, and sweet potato mash',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
    prepTime: '30 mins',
    calories: 420,
    category: 'dinner',
    dietaryType: 'non-vegetarian',
    tags: ['omega-3', 'nutrient-dense', 'high-protein'],
    ingredients: ['Salmon Fillet', 'Asparagus', 'Sweet Potato', 'Lemon', 'Dill', 'Olive Oil', 'Garlic', 'Black Pepper'],
    steps: [
      'Preheat oven to 400°F (200°C).',
      'Season salmon with garlic, dill, lemon juice, and black pepper.',
      'Bake salmon for about 15 minutes until it flakes easily.',
      'Steam or roast asparagus until tender-crisp.',
      'Boil sweet potato chunks, then mash with a little olive oil.',
      'Plate everything together and garnish with fresh dill and lemon wedges.'
    ]
  },
  {
    id: 20,
    title: 'Lean Chicken Stir Fry',
    description: 'Chicken breast with broccoli and soy-ginger sauce',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
    prepTime: '25 mins',
    calories: 350,
    category: 'dinner',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'low-carb', 'quick'],
    ingredients: ['Chicken Breast', 'Broccoli', 'Bell Peppers', 'Snow Peas', 'Garlic', 'Ginger', 'Low-sodium Soy Sauce', 'Sesame Oil'],
    steps: [
      'Slice chicken breast into thin strips.',
      'Heat sesame oil in a wok and stir-fry chicken until no longer pink.',
      'Remove chicken and stir-fry vegetables with minced garlic and ginger.',
      'Return chicken to the wok and add soy sauce.',
      'Toss everything together and cook for another 2 minutes.',
      'Serve hot, optionally with brown rice or cauliflower rice.'
    ]
  },
  {
    id: 21,
    title: 'Shrimp & Veggie Skillet',
    description: 'Low-fat, high-protein shrimp sauté with zucchini and bell peppers',
    image: 'https://images.unsplash.com/photo-1535400255456-49c7273b6126',
    prepTime: '20 mins',
    calories: 280,
    category: 'dinner',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'low-fat', 'quick'],
    ingredients: ['Shrimp', 'Zucchini', 'Bell Peppers', 'Onions', 'Garlic', 'Lemon', 'Parsley', 'Olive Oil', 'Red Pepper Flakes'],
    steps: [
      'Clean and devein shrimp, pat dry with paper towels.',
      'Heat olive oil in a skillet and sauté shrimp until pink, about 2 minutes per side.',
      'Remove shrimp and add sliced vegetables to the same pan.',
      'Cook vegetables until tender-crisp, about 5 minutes.',
      'Return shrimp to the pan, add minced garlic and red pepper flakes.',
      'Squeeze fresh lemon juice over everything, sprinkle with parsley, and serve.'
    ]
  },
  // Non-Vegetarian Snacks
  {
    id: 22,
    title: 'Boiled Egg Protein Pops',
    description: 'Seasoned eggs with black salt and herbs',
    image: 'https://images.unsplash.com/photo-1498654077230-3328f2fce6c9',
    prepTime: '15 mins + cooling',
    calories: 70,
    category: 'snack',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'keto-friendly', 'portable'],
    ingredients: ['Eggs', 'Black Salt', 'Black Pepper', 'Paprika', 'Fresh Herbs (dill, parsley)', 'Olive Oil Spray'],
    steps: [
      'Hard boil eggs, cool completely, and peel.',
      'Cut eggs in half or quarters.',
      'Mix black salt, pepper, paprika, and finely chopped herbs.',
      'Lightly spray eggs with olive oil and roll in the seasoning mix.',
      'Store in airtight containers in the refrigerator for up to 3 days.'
    ]
  },
  {
    id: 23,
    title: 'Spicy Grilled Chicken Strips',
    description: 'Lean chicken slices as portable protein',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
    prepTime: '25 mins + marinating',
    calories: 150,
    category: 'snack',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'low-carb', 'meal-prep'],
    ingredients: ['Chicken Breast', 'Yogurt', 'Lemon Juice', 'Garlic', 'Ginger', 'Tandoori Masala', 'Olive Oil'],
    steps: [
      'Slice chicken breast into thin strips.',
      'Mix yogurt, lemon juice, minced garlic, ginger, and tandoori masala.',
      'Marinate chicken strips for at least 1 hour, preferably overnight.',
      'Grill or pan-fry until fully cooked and slightly charred.',
      'Let cool and store in airtight containers.',
      'Eat cold or reheat as needed for a protein-rich snack.'
    ]
  },
  {
    id: 24,
    title: 'Tuna Cucumber Bites',
    description: 'Tuna salad scooped into cucumber rounds',
    image: 'https://images.unsplash.com/photo-1581012721564-49a3f696bef7',
    prepTime: '15 mins',
    calories: 110,
    category: 'snack',
    dietaryType: 'non-vegetarian',
    tags: ['high-protein', 'low-carb', 'quick'],
    ingredients: ['Canned Tuna (in water)', 'Cucumber', 'Greek Yogurt', 'Lemon Juice', 'Dill', 'Red Onion', 'Capers', 'Black Pepper'],
    steps: [
      'Drain tuna well and flake with a fork.',
      'Mix with Greek yogurt, finely diced red onion, capers, lemon juice, and dill.',
      'Slice cucumber into thick rounds.',
      'Using a small spoon, scoop out some of the center of each cucumber round.',
      'Fill each cucumber cup with tuna mixture.',
      'Refrigerate until ready to serve, up to 24 hours.'
    ]
  }
];

const RecipePage = () => {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [aiRecipes, setAiRecipes] = useState<PersonalizedRecipe[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiRecipes, setShowAiRecipes] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Check AI configuration on component mount
  useEffect(() => {
    const config = aiService.getConfigurationStatus();
    setAiConfigured(config.configured);
  }, []);

  // Generate AI recipes when user data is available
  const generateAiRecipes = async () => {
    if (!aiConfigured || !userData || loadingAi) return;

    setLoadingAi(true);
    try {
      const personalizedRecipes = await aiService.generatePersonalizedRecipes(userData, 6, ingredientsInput);
      setAiRecipes(personalizedRecipes);
      setShowAiRecipes(true);
      toast({
        title: "AI Recipes Generated!",
        description: "Your personalized recipes are ready.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to Generate Recipes",
        description: "Using fallback recommendations instead.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Combine AI recipes with static recipes
  const allRecipes = showAiRecipes ? [...aiRecipes, ...recipeData] : recipeData;

  // Filter recipes based on search term and active tab
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (currentTab === 'all') return matchesSearch;
    if (currentTab === 'veg') return matchesSearch && recipe.dietaryType === 'vegetarian';
    if (currentTab === 'non-veg') return matchesSearch && recipe.dietaryType === 'non-vegetarian';
    if (currentTab === 'breakfast') return matchesSearch && recipe.category === 'breakfast';
    if (currentTab === 'lunch') return matchesSearch && recipe.category === 'lunch';
    if (currentTab === 'dinner') return matchesSearch && recipe.category === 'dinner';
    if (currentTab === 'snack') return matchesSearch && recipe.category === 'snack';

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold">Healthy Recipes</h1>
            <p className="text-gray-600">
              Discover delicious and nutritious Indian recipes tailored to your fitness goals.
              {userData.fitnessGoal && userData.dietaryPreference && (
                <span className="font-medium"> Personalized for your {userData.fitnessGoal.replace('-', ' ')} goal and {userData.dietaryPreference} preference.</span>
              )}
            </p>
            <p className="text-sm text-fitfuel-purple italic">
              {showAiRecipes ? 'AI-personalized recipes are now included in the results!' : 'Generate personalized recipes with AI based on your profile.'}
            </p>
          </div>

          {/* Natural Language Search - Always Visible */}
          {aiConfigured ? (
            <div className="mb-6">
              <NaturalLanguageInput
                type="recipe"
                placeholder="✨ Describe your ideal meal (e.g., 'High protein breakfast under 400 calories')"
                isLoading={loadingAi}
                onSearch={async (query) => {
                  setLoadingAi(true);
                  try {
                    const mode = userData?.dietaryPreference ? 'strict_profile' : 'guest';
                    const results = await aiService.generateFromNaturalLanguage(
                      userData,
                      query,
                      'recipe',
                      mode
                    ) as PersonalizedRecipe[];
                    setAiRecipes(results);
                    setShowAiRecipes(true);
                    toast({
                      title: 'Recipe Generated!',
                      description: `Created ${results.length} personalized recipe(s) for you.`,
                    });
                  } catch (error) {
                    console.error('Recipe generation failed:', error);
                    toast({
                      title: 'Generation Failed',
                      description: 'Could not generate recipe. Try again.',
                      variant: 'destructive'
                    });
                  } finally {
                    setLoadingAi(false);
                  }
                }}
                onFoodScan={(prediction: FoodPrediction) => {
                  console.log('Food scanned:', prediction);
                  toast({
                    title: 'Food Detected!',
                    description: `${prediction.className} - Est. ${prediction.estimatedCalories} kcal`,
                  });
                }}
              />
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AI recipe generation is not configured. Add your API key to enable personalized recommendations.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Banner - Only for authenticated users */}
          {userData?.dietaryPreference && (
            <Alert className="mb-6 bg-purple-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Showing recipes personalized for your <strong>{userData.dietaryPreference}</strong> diet and <strong>{userData.fitnessGoal || 'fitness'}</strong> goal.
                <Link to="/profile" className="ml-2 underline">Update Profile</Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Floating Action Button (FAB) for Camera */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={() => setShowCamera(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center animate-bounce-slow"
            >
              <Camera size={32} />
            </Button>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <FoodCamera
              onClose={() => setShowCamera(false)}
              onCapture={(data) => {
                console.log("Captured:", data);
                setShowCamera(false);
                toast({
                  title: data.type === 'vision' ? `Identified: ${data.value}` : `Scanned Barcode: ${data.value}`,
                  description: `Confidence: ${data.confidence ? Math.round(data.confidence * 100) : 100}% - Fetching Macros...`,
                });
                // TODO: Call OpenFoodFacts here
              }}
            />
          )}

          {/* AI Generated Recipes Loading */}
          {loadingAi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search and Filter - Guest-Aware */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search recipes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Only show manual filters for guests or users without dietary preference */}
            {!userData?.dietaryPreference && (
              <Tabs defaultValue="all" className="w-full md:w-2/3" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="veg">Vegetarian</TabsTrigger>
                  <TabsTrigger value="non-veg">Non-Veg</TabsTrigger>
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">Lunch</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  <TabsTrigger value="snack">Snacks</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex flex-col justify-center items-center text-center space-y-2 border-b">
                    {String(recipe.id).startsWith('ai-') ? (
                      <Sparkles className="h-10 w-10 text-fitfuel-purple mb-2" />
                    ) : (
                      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                        {recipe.category === 'breakfast' && <span className="text-2xl">🍳</span>}
                        {recipe.category === 'lunch' && <span className="text-2xl">🥗</span>}
                        {recipe.category === 'dinner' && <span className="text-2xl">🥘</span>}
                        {recipe.category === 'snack' && <span className="text-2xl">🍎</span>}
                      </div>
                    )}
                    <h3 className="font-heading font-bold text-xl text-gray-800 line-clamp-2 px-2">
                      {recipe.title}
                    </h3>
                  </div>

                  <CardHeader className="pt-4 pb-2">
                    <CardDescription className="line-clamp-2 mt-2">{recipe.description}</CardDescription>
                  </CardHeader>

                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedRecipe(recipe)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No recipes found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        </div>


        {/* Recipe Detail Modal */}
        {
          selectedRecipe && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 shadow-2xl">
                {/* Header Section (No Image) */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-heading font-bold mb-2">{selectedRecipe.title}</h2>
                      <p className="text-purple-100 text-lg opacity-90">{selectedRecipe.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 -mt-2 -mr-2"
                      onClick={() => setSelectedRecipe(null)}
                    >
                      <span className="text-2xl">&times;</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                      <Flame className="h-5 w-5 mr-2 text-orange-300" />
                      <span className="font-bold">{selectedRecipe.calories} kcal</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                      <Clock className="h-5 w-5 mr-2 text-blue-200" />
                      <span className="font-bold">{selectedRecipe.prepTime}</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                      <span className="mr-2 text-xl">🍽️</span>
                      <span className="capitalize">{selectedRecipe.dietaryType}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                  {/* Ingredients Column */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                      <span className="bg-purple-100 p-1.5 rounded-md mr-2">🥬</span>
                      Ingredients & Requirements
                    </h3>
                    <Card className="border-purple-100 shadow-sm">
                      <CardContent className="p-0">
                        <ul className="divide-y divide-purple-50">
                          {selectedRecipe.ingredients.map((ingredient: string, idx: number) => (
                            <li key={idx} className="flex items-center p-3 hover:bg-purple-50/50 transition-colors text-gray-700">
                              <div className="h-1.5 w-1.5 bg-purple-400 rounded-full mr-3"></div>
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-700 mb-2">Nutritional Breakdown (est.)</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                          <div className="text-sm text-gray-500">Protein</div>
                          <div className="font-bold text-orange-700">High</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-500">Carbs</div>
                          <div className="font-bold text-green-700">Moderate</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-500">Fats</div>
                          <div className="font-bold text-blue-700">Low</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps Column */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                      <span className="bg-purple-100 p-1.5 rounded-md mr-2">👨‍🍳</span>
                      Preparation Steps
                    </h3>
                    <div className="space-y-4">
                      {selectedRecipe.steps.map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 h-8 w-8 bg-fitfuel-purple text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            {idx + 1}
                          </div>
                          <p className="text-gray-600 leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        }

      </div>
    </div>
  );
};

export default RecipePage;
