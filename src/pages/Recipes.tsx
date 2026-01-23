import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Clock, Flame, Sparkles, AlertCircle, DatabaseZap, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { aiService } from '@/services/aiService';
import { PersonalizedRecipe } from '@/types/aiTypes';
import { toast } from '@/hooks/use-toast';
import FoodCamera from '@/components/calories/FoodCamera';
import { Camera } from 'lucide-react';
import NaturalLanguageInput from '@/components/ui/NaturalLanguageInput';
import { FoodPrediction } from '@/services/vision/nutritionScanner';
import { saveAiRecipe } from '@/integrations/firebase/firestore';
import { validateRecipe, Recipe } from '@/utils/dietaryValidator';

// Firebase Imports
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { auth } from '@/integrations/firebase/auth';

// ============================================================================
// NO HARDCODED DATA - ALL RECIPES COME FROM FIRESTORE
// ============================================================================

interface FirestoreRecipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  prepTime: string;
  calories: number;
  category: string;
  dietaryType: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
  source?: 'seeded' | 'ai_generated';
}

const RecipePage = () => {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<FirestoreRecipe | null>(null);
  const [currentTab, setCurrentTab] = useState('All');
  const [showCamera, setShowCamera] = useState(false);

  // Firestore State
  const [firestoreRecipes, setFirestoreRecipes] = useState<FirestoreRecipe[]>([]);
  const [userGeneratedRecipes, setUserGeneratedRecipes] = useState<FirestoreRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Check AI configuration on mount
  useEffect(() => {
    const config = aiService.getConfigurationStatus();
    setAiConfigured(config.configured);
  }, []);

  // ============================================================================
  // FIRESTORE SUBSCRIPTION: Global Recipes Collection
  // ============================================================================
  useEffect(() => {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, orderBy('title'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipes: FirestoreRecipe[] = [];
      snapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() } as FirestoreRecipe);
      });
      setFirestoreRecipes(recipes);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching recipes:', error);
      setLoading(false);
      toast({
        title: 'Error Loading Recipes',
        description: 'Could not fetch recipes from database.',
        variant: 'destructive'
      });
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // FIRESTORE SUBSCRIPTION: User's AI-Generated Recipes
  // ============================================================================
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setUserGeneratedRecipes([]);
      return;
    }

    // Fetch from ai_recipes collection filtered by userId
    const aiRecipesRef = collection(db, 'ai_recipes');
    const q = query(aiRecipesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipes: FirestoreRecipe[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: doc.id,
          title: data.title || 'AI Recipe',
          description: data.description || '',
          prepTime: data.prepTime || data.prep_time || '30 mins',
          calories: data.calories || 0,
          category: data.category || 'lunch',
          dietaryType: data.dietaryType || data.dietary_type || 'vegetarian',
          tags: data.tags || [],
          ingredients: data.ingredients || [],
          steps: data.steps || data.instructions || [],
          source: 'ai_generated'
        } as FirestoreRecipe);
      });
      setUserGeneratedRecipes(recipes);
    }, (error) => {
      console.error('Error fetching user AI recipes:', error);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  // ============================================================================
  // COMBINE ALL RECIPES
  // ============================================================================
  const allRecipes = [...userGeneratedRecipes, ...firestoreRecipes];

  // ============================================================================
  // THE RENDER GUARD - CRITICAL DIETARY ENFORCEMENT
  // ============================================================================
  const validRecipes = allRecipes.filter((recipe) => {
    // 1. Search Filter
    if (searchTerm && !recipe.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 2. LOGGED IN USER: Strict Profile Enforcement via Validator
    if (userData?.dietaryPreference) {
      const check = validateRecipe(userData, recipe as Recipe);
      if (!check.valid) {
        return false; // IT DOES NOT EXIST for this user
      }
    }

    // 3. GUEST MODE: Tab Filter
    if (!userData?.dietaryPreference && currentTab !== 'All') {
      if (currentTab === 'Vegan' && !recipe.tags?.some(t => t.toLowerCase() === 'vegan')) return false;
      if (currentTab === 'Vegetarian' && recipe.dietaryType !== 'vegetarian') return false;
      if (currentTab === 'Keto' && !recipe.tags?.some(t => t.toLowerCase().includes('keto'))) return false;
      if (currentTab === 'Paleo' && !recipe.tags?.some(t => t.toLowerCase().includes('paleo'))) return false;
      if (currentTab === 'Gluten-Free' && !recipe.tags?.some(t => t.toLowerCase().includes('gluten-free'))) return false;
    }

    return true;
  });

  // ============================================================================
  // SEED DATABASE FUNCTION
  // ============================================================================
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      // Dynamic import of seed function
      const { seedDatabase } = await import('@/scripts/seedDatabase');
      await seedDatabase();
      toast({
        title: 'Database Seeded!',
        description: 'Sample recipes have been added to your database.',
      });
    } catch (error) {
      console.error('Seeding failed:', error);
      toast({
        title: 'Seeding Failed',
        description: 'Could not seed database. Try running: npx ts-node src/scripts/seedDatabase.ts',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Guest Tab Options
  const GUEST_TABS = ['All', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'];
  const isGuest = !userData?.dietaryPreference;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold">Healthy Recipes</h1>
            <p className="text-gray-600">
              Discover delicious and nutritious recipes tailored to your fitness goals.
              {userData?.fitnessGoal && userData?.dietaryPreference && (
                <span className="font-medium"> Personalized for your {userData.fitnessGoal.replace('-', ' ')} goal and {userData.dietaryPreference} preference.</span>
              )}
            </p>
          </div>

          {/* Natural Language Search - AI Enabled */}
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

                    // Save to Firestore for authenticated users
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      for (const recipe of results) {
                        await saveAiRecipe(currentUser.uid, recipe);
                      }
                      toast({
                        title: 'Recipe Generated & Saved!',
                        description: `Created ${results.length} personalized recipe(s) and saved to your collection.`,
                      });
                    } else {
                      toast({
                        title: 'Recipe Generated!',
                        description: `Created ${results.length} personalized recipe(s). Log in to save.`,
                      });
                    }
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

          {/* Logged In User Notice - Strict Filter Active */}
          {!isGuest && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm font-medium border border-green-200">
              🔒 Results are strictly filtered for your <strong>{userData?.dietaryPreference}</strong> diet.
              <Link to="/profile" className="ml-2 underline">Update Profile</Link>
            </div>
          )}

          {/* Guest Tab Filters */}
          {isGuest && (
            <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
              {GUEST_TABS.map(tab => (
                <Button
                  key={tab}
                  variant={currentTab === tab ? "default" : "outline"}
                  onClick={() => setCurrentTab(tab)}
                  size="sm"
                  className={currentTab === tab ? 'bg-purple-600 text-white' : ''}
                >
                  {tab}
                </Button>
              ))}
            </div>
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
                setShowCamera(false);
                toast({
                  title: data.type === 'vision' ? `Identified: ${data.value}` : `Scanned Barcode: ${data.value}`,
                  description: `Confidence: ${data.confidence ? Math.round(data.confidence * 100) : 100}% - Fetching Macros...`,
                });
              }}
            />
          )}

          {/* Search Bar */}
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
          </div>

          {/* Loading State */}
          {loading && (
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

          {/* AI Loading State */}
          {loadingAi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`ai-loading-${index}`} className="overflow-hidden border-purple-200">
                  <Skeleton className="h-48 w-full bg-purple-100" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-purple-100" />
                    <Skeleton className="h-4 w-full bg-purple-50" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* ================================================================ */}
          {/* ZERO STATE - Empty Database Handler */}
          {/* ================================================================ */}
          {!loading && validRecipes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full p-8 mb-6">
                <DatabaseZap className="h-16 w-16 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Recipes Found</h2>
              <p className="text-gray-600 text-center max-w-md mb-6">
                {userData?.dietaryPreference
                  ? `No ${userData.dietaryPreference} recipes available yet. Initialize the database or generate some with AI!`
                  : 'Your recipe database is empty. Click below to add sample recipes.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg"
                >
                  {isSeeding ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <DatabaseZap className="mr-2 h-5 w-5" />
                      Initialize Database
                    </>
                  )}
                </Button>
                {aiConfigured && (
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="Describe your ideal meal"]') as HTMLInputElement;
                      input?.focus();
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate with AI
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Recipe Grid */}
          {!loading && validRecipes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {validRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex flex-col justify-center items-center text-center space-y-2 border-b">
                    {recipe.source === 'ai_generated' ? (
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
              ))}
            </div>
          )}
        </div>

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 shadow-2xl">
              {/* Header Section */}
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
                  {selectedRecipe.source === 'ai_generated' && (
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                      <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
                      <span>AI Generated</span>
                    </div>
                  )}
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
                        {selectedRecipe.ingredients?.map((ingredient: string, idx: number) => (
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
                    {selectedRecipe.steps?.map((step: string, idx: number) => (
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
        )}
      </div>
    </div>
  );
};

export default RecipePage;
