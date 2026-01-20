
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiService, DashboardInsights } from '@/services/aiService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Calendar,
  Target,
  Trophy,
  Flame,
  Timer,
  Heart,
  TrendingUp,
  Users,
  Award,
  Dumbbell,
  Apple,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FoodCamera from '@/components/calories/FoodCamera';
import CalorieAnalysisResult from '@/components/calories/CalorieAnalysisResult';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { userData } = useUser();
  const [aiInsights, setAiInsights] = useState<DashboardInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);

  // AI Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Sample data for display
  const weeklyProgress = [
    { day: 'Mon', completed: true, workoutTime: 45 },
    { day: 'Tue', completed: true, workoutTime: 30 },
    { day: 'Wed', completed: false, workoutTime: 0 },
    { day: 'Thu', completed: true, workoutTime: 60 },
    { day: 'Fri', completed: false, workoutTime: 0 },
    { day: 'Sat', completed: true, workoutTime: 75 },
    { day: 'Sun', completed: false, workoutTime: 0 },
  ];

  const achievements = [
    { icon: Trophy, title: "7-Day Streak", description: "Completed workouts for 7 consecutive days", earned: true },
    { icon: Flame, title: "Calorie Burner", description: "Burned 1000+ calories in a week", earned: true },
    { icon: Timer, title: "Early Bird", description: "Completed 5 morning workouts", earned: false },
    { icon: Heart, title: "Cardio Champion", description: "Completed 10 cardio sessions", earned: false },
  ];

  const stats = [
    { label: "Workouts This Week", value: "4", icon: Dumbbell, color: "bg-fitfusion-purple" },
    { label: "Calories Burned", value: "1,247", icon: Flame, color: "bg-fitfusion-orange" },
    { label: "Active Minutes", value: "210", icon: Timer, color: "bg-fitfusion-green" },
    { label: "Streak Days", value: "12", icon: Trophy, color: "bg-fitfusion-blue" },
  ];

  // Check AI configuration and generate insights
  useEffect(() => {
    const config = aiService.getConfigurationStatus();
    setAiConfigured(config.configured);

    if (config.configured && userData) {
      generateInsights();
    }
  }, [userData]);

  const generateInsights = async () => {
    if (!aiConfigured || !userData || loadingInsights) return;

    setLoadingInsights(true);
    try {
      const progressData = {
        weeklyProgress,
        completedWorkouts,
        totalWorkoutTime,
        weeklyGoal,
        achievements: achievements.filter(a => a.earned),
        stats
      };

      const insights = await aiService.generateDashboardInsights(userData, progressData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleCapture = async (imageSrc: string) => {
    setScannedImage(imageSrc);
    setIsAnalyzing(true);

    try {
      const result = await aiService.analyzeFoodImage(imageSrc);
      setAnalysisResult(result);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive"
      });
      setScannedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetScan = () => {
    setScannedImage(null);
    setAnalysisResult(null);
  };

  const handleLogMeal = () => {
    toast({
      title: "Meal Logged!",
      description: `Logged ${analysisResult.calories} kcal for ${analysisResult.foodName}.`,
    });
    setIsScannerOpen(false);
    handleResetScan();
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'Weight Loss': return 'bg-fitfusion-red';
      case 'Muscle Gain': return 'bg-fitfusion-purple';
      case 'General Fitness': return 'bg-fitfusion-green';
      case 'Endurance': return 'bg-fitfusion-blue';
      default: return 'bg-gray-500';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'Weight Loss': return TrendingUp;
      case 'Muscle Gain': return Dumbbell;
      case 'General Fitness': return Heart;
      case 'Endurance': return Timer;
      default: return Target;
    }
  };

  const completedWorkouts = weeklyProgress.filter(day => day.completed).length;
  const weeklyGoal = 5;
  const progressPercentage = (completedWorkouts / weeklyGoal) * 100;

  const totalWorkoutTime = weeklyProgress.reduce((total, day) => total + day.workoutTime, 0);

  // Calculate BMI if height and weight are available
  const calculateBMI = () => {
    if (userData.height && userData.weight) {
      const heightInMeters = userData.height / 100;
      return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-fitfusion-blue" };
    if (bmi < 25) return { category: "Normal", color: "text-fitfusion-green" };
    if (bmi < 30) return { category: "Overweight", color: "text-fitfusion-orange" };
    return { category: "Obese", color: "text-fitfusion-red" };
  };

  const getPersonalizedRecommendation = () => {
    const isVegetarian = userData.dietaryPreference === 'Veg' || userData.dietaryPreference === 'Vegan';
    const isVegan = userData.dietaryPreference === 'Vegan';

    if (userData.fitnessGoal === 'Weight Loss') {
      return {
        title: "Weight Loss Focus",
        description: isVegan ? "Try our plant-based HIIT workouts with quinoa protein bowls" : "High-intensity cardio with lean protein meals recommended",
        action: "Start HIIT Workout",
        color: "border-fitfusion-red"
      };
    }

    if (userData.fitnessGoal === 'Muscle Gain') {
      return {
        title: "Muscle Building",
        description: "Strength training with progressive overload and high-protein nutrition",
        action: "View Strength Programs",
        color: "border-fitfusion-purple"
      };
    }

    return {
      title: "General Fitness",
      description: "Balanced workout routine with varied exercises and nutritious meals",
      action: "Explore Workouts",
      color: "border-fitfusion-green"
    };
  };

  const recommendation = getPersonalizedRecommendation();
  const bmi = calculateBMI();
  const bmiData = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const GoalIcon = getGoalIcon(userData.fitnessGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitfusion-purple/5 via-white to-fitfusion-blue/5 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue bg-clip-text text-transparent">
            Welcome back, {userData.name || 'Fitness Enthusiast'}!
          </h1>
          <p className="text-gray-600">Ready to crush your fitness goals today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-fitfusion-purple" />
                Weekly Progress
              </CardTitle>
              <CardDescription>
                {completedWorkouts} of {weeklyGoal} workouts completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-7 gap-2">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium ${day.completed
                        ? 'bg-fitfusion-green text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                      {day.completed ? '✓' : day.day[0]}
                    </div>
                    <p className="text-xs text-gray-500">{day.day}</p>
                    {day.workoutTime > 0 && (
                      <p className="text-xs text-fitfusion-green font-medium">{day.workoutTime}m</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Total workout time this week: <span className="font-semibold text-fitfusion-purple">{totalWorkoutTime} minutes</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-fitfusion-blue" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.fitnessGoal && (
                <div className="flex items-center gap-3">
                  <div className={`${getGoalColor(userData.fitnessGoal)} w-10 h-10 rounded-full flex items-center justify-center`}>
                    <GoalIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.fitnessGoal}</p>
                    <p className="text-sm text-gray-600">Current Goal</p>
                  </div>
                </div>
              )}

              {userData.activityLevel && (
                <div className="flex items-center gap-3">
                  <div className="bg-fitfusion-orange w-10 h-10 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.activityLevel}</p>
                    <p className="text-sm text-gray-600">Fitness Level</p>
                  </div>
                </div>
              )}

              {userData.dietaryPreference && (
                <div className="flex items-center gap-3">
                  <div className="bg-fitfusion-green w-10 h-10 rounded-full flex items-center justify-center">
                    <Apple className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.dietaryPreference}</p>
                    <p className="text-sm text-gray-600">Diet Preference</p>
                  </div>
                </div>
              )}

              {bmi && bmiData && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-xl font-bold">{bmi}</p>
                  <p className={`text-sm font-medium ${bmiData.color}`}>{bmiData.category}</p>
                </div>
              )}

              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Recommendation */}
        <Card className={`border-2 ${recommendation.color}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-fitfusion-purple" />
              Personalized Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                <p className="text-gray-600">{recommendation.description}</p>
              </div>
              <Link to="/workouts">
                <Button className="bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue text-white">
                  {recommendation.action}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        {aiConfigured && (
          <Card className="border-2 border-fitfusion-blue/20 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-fitfusion-blue" />
                  AI Insights
                </div>
                {userData && !loadingInsights && (
                  <Button
                    onClick={generateInsights}
                    variant="outline"
                    size="sm"
                    className="text-fitfusion-blue border-fitfusion-blue hover:bg-fitfusion-blue/10"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Personalized insights based on your progress</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInsights ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ) : aiInsights ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-fitfusion-blue/20">
                      <h4 className="font-semibold text-fitfusion-blue mb-2">💡 Personalized Tip</h4>
                      <p className="text-gray-700 text-sm">{aiInsights.personalizedTip}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-fitfusion-green/20">
                      <h4 className="font-semibold text-fitfusion-green mb-2">🎯 Recommended Action</h4>
                      <p className="text-gray-700 text-sm">{aiInsights.recommendedAction}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-fitfusion-purple/20">
                      <h4 className="font-semibold text-fitfusion-purple mb-2">📊 Progress Analysis</h4>
                      <p className="text-gray-700 text-sm">{aiInsights.progressAnalysis}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-fitfusion-orange/20">
                      <h4 className="font-semibold text-fitfusion-orange mb-2">🚀 Motivation</h4>
                      <p className="text-gray-700 text-sm">{aiInsights.motivationalMessage}</p>
                    </div>
                  </div>
                </div>
              ) : userData ? (
                <div className="text-center py-8">
                  <Button
                    onClick={generateInsights}
                    className="bg-fitfusion-blue hover:bg-fitfusion-blue/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </Button>
                  <p className="text-gray-600 text-sm mt-2">Get personalized insights about your fitness journey</p>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Complete your profile to get personalized AI insights. <Link to="/profile" className="text-fitfusion-blue underline">Update Profile</Link>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-fitfusion-yellow" />
              Achievements
            </CardTitle>
            <CardDescription>Your fitness milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${achievement.earned
                        ? 'border-fitfusion-yellow bg-fitfusion-yellow/10'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${achievement.earned ? 'bg-fitfusion-yellow' : 'bg-gray-300'
                      }`}>
                      <Icon className={`h-6 w-6 ${achievement.earned ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <h3 className="font-semibold text-sm">{achievement.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge variant="secondary" className="mt-2 bg-fitfusion-yellow text-white">
                        Earned!
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/workouts">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-purple w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Start Workout</h3>
                <p className="text-sm text-gray-600">Begin your fitness session</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/recipes">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-green w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Apple className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Nutrition</h3>
                <p className="text-sm text-gray-600">Explore healthy recipes</p>
              </CardContent>
            </Card>
          </Link>

          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-fitfusion-purple/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-700">Scan Meal (AI)</h3>
                  <p className="text-sm text-gray-600">Instant calorie analysis</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-950 border-slate-800">
              {analysisResult ? (
                <div className="p-4 bg-slate-50">
                  <CalorieAnalysisResult
                    data={analysisResult}
                    onReset={handleResetScan}
                    onLog={handleLogMeal}
                  />
                </div>
              ) : (
                <FoodCamera onCapture={handleCapture} onCancel={() => setIsScannerOpen(false)} />
              )}
            </DialogContent>
          </Dialog>

          <Link to="/assistant">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-blue w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-gray-600">Get personalized advice</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/community">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-orange w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-gray-600">Connect with others</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
