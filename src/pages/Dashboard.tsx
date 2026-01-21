
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiService, DashboardInsights } from '@/services/aiService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserWorkoutLogs, WorkoutLog } from '@/integrations/firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, endOfWeek, isWithinInterval, subDays, isSameDay, format, parseISO } from 'date-fns';
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
  const { userData, user } = useUser(); // Get auth user for ID
  const [aiInsights, setAiInsights] = useState<DashboardInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);

  // Real Data State
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    streak: 0
  });

  // AI Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Load Real Data
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user) return;
      setLoadingLogs(true);

      const { logs } = await getUserWorkoutLogs(user.uid);
      setWorkoutLogs(logs);

      // Calculate Stats
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const thisWeekLogs = logs.filter(log => isWithinInterval(log.date, { start: weekStart, end: weekEnd }));

      const calories = logs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
      const minutes = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

      // Calculate Streak
      let currentStreak = 0;
      const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());

      if (sortedLogs.length > 0) {
        let checkDate = now;
        // Check if did workout today
        if (isSameDay(sortedLogs[0].date, checkDate)) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else if (isSameDay(sortedLogs[0].date, subDays(checkDate, 1))) {
          // Or yesterday (streak valid if missed today but did yesterday? standard logic usually requires today or yesterday to keep alive)
          checkDate = subDays(checkDate, 1);
        }

        // Simple iteration for previous days
        // Note: exact consecutive day logic can be complex with multiple logs per day.
        // Simplified: Unique days with workouts.
        const uniqueDays = Array.from(new Set(logs.map(l => format(l.date, 'yyyy-MM-dd')))).sort().reverse();
        if (uniqueDays.length > 0) {
          const todayStr = format(now, 'yyyy-MM-dd');
          const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');

          // If most recent is today or yesterday, streak is alive
          if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
            currentStreak = 1;
            let prevDate = parseISO(uniqueDays[0]);

            for (let i = 1; i < uniqueDays.length; i++) {
              const currDate = parseISO(uniqueDays[i]);
              if (isSameDay(currDate, subDays(prevDate, 1))) {
                currentStreak++;
                prevDate = currDate;
              } else {
                break;
              }
            }
          }
        }
      }

      setStats({
        workoutsThisWeek: thisWeekLogs.length,
        caloriesBurned: calories,
        activeMinutes: minutes,
        streak: currentStreak
      });

      setLoadingLogs(false);
    };

    fetchRealData();
  }, [user]);


  // Check AI configuration and generate insights
  useEffect(() => {
    const config = aiService.getConfigurationStatus();
    setAiConfigured(config.configured);

    if (config.configured && userData && !loadingLogs) {
      generateInsights();
    }
  }, [userData, loadingLogs]);

  const generateInsights = async () => {
    if (!aiConfigured || !userData || loadingInsights) return;

    setLoadingInsights(true);
    try {
      const progressData = {
        stats,
        recentLogs: workoutLogs.slice(0, 5)
      };

      const insights = await aiService.generateDashboardInsights(userData, progressData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Prepare Chart Data
  const chartData = [
    { name: 'Mon', minutes: 0 },
    { name: 'Tue', minutes: 0 },
    { name: 'Wed', minutes: 0 },
    { name: 'Thu', minutes: 0 },
    { name: 'Fri', minutes: 0 },
    { name: 'Sat', minutes: 0 },
    { name: 'Sun', minutes: 0 },
  ];

  if (!loadingLogs) {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    workoutLogs.forEach(log => {
      if (isWithinInterval(log.date, { start: weekStart, end: endOfWeek(now, { weekStartsOn: 1 }) })) {
        const dayIndex = (log.date.getDay() + 6) % 7; // Shift Sun(0) to 6, Mon(1) to 0
        chartData[dayIndex].minutes += log.duration;
      }
    });
  }

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

  const handleLogMeal = async () => {
    if (!user || !analysisResult) return;

    try {
      await import('@/integrations/firebase/firestore').then(({ logNutrition }) =>
        logNutrition({
          userId: user.uid,
          foodName: analysisResult.foodName,
          calories: analysisResult.calories,
          macros: {
            protein: analysisResult.protein,
            carbs: analysisResult.carbs,
            fat: analysisResult.fat
          },
          date: new Date(),
          mealType: 'snack' // Defaulting to snack for quick scan
        })
      );

      toast({
        title: "Meal Logged",
        description: `added ${analysisResult.calories} kcal to your daily total.`,
      });

      // Update local stats visually (optional, real update happens on refresh/listener)
      setStats(prev => ({
        ...prev,
        caloriesBurned: prev.caloriesBurned // This is burned, not consumed. In full app we'd track consumed separately.
        // For now just logging it to DB is the goal.
      }));

    } catch (e) {
      console.error("Failed to log meal", e);
      toast({ title: "Error", description: "Could not save meal.", variant: "destructive" });
    }

    setIsScannerOpen(false);
    handleResetScan();
  };

  const getPersonalizedRecommendation = () => {
    if (userData.fitnessGoal === 'Weight Loss') {
      return {
        title: "Weight Loss Focus",
        description: "High-intensity cardio with lean protein meals recommended",
        action: "Start HIIT Workout",
        color: "border-fitfusion-red"
      };
    }
    return {
      title: "General Fitness",
      description: "Balanced workout routine with varied exercises",
      action: "Explore Workouts",
      color: "border-fitfusion-green"
    };
  };

  const recommendation = getPersonalizedRecommendation();

  const displayStats = [
    { label: "Workouts This Week", value: stats.workoutsThisWeek, icon: Dumbbell, color: "bg-fitfusion-purple" },
    { label: "Calories Burned", value: stats.caloriesBurned, icon: Flame, color: "bg-fitfusion-orange" },
    { label: "Active Minutes", value: stats.activeMinutes, icon: Timer, color: "bg-fitfusion-green" },
    { label: "Streak Days", value: stats.streak, icon: Trophy, color: "bg-fitfusion-blue" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitfusion-purple/5 via-white to-fitfusion-blue/5 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue bg-clip-text text-transparent">
            Welcome back, {userData.name || 'Athlete'}!
          </h1>
          <p className="text-gray-600">Dynamic Dashboard • Live Data</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingLogs ? <Skeleton className="h-8 w-12 mx-auto" /> : stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-fitfusion-purple" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Minutes of activity per day (Current Week)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] w-full">
              {loadingLogs ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#9333ea' : '#e5e7eb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* User Profile Summary / Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-fitfusion-blue" />
                Current Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-semibold text-purple-900">{recommendation.title}</h3>
                <p className="text-sm text-purple-700 mt-1">{recommendation.description}</p>
              </div>

              <Link to="/profile">
                <Button variant="outline" className="w-full mt-2">
                  View Health Stats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights & Actions */}
        {aiConfigured && (
          <Card className="border-2 border-fitfusion-blue/20 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-fitfusion-blue" />
                  AI Coach Insights
                </div>
                {!loadingInsights && (
                  <Button onClick={generateInsights} variant="ghost" size="sm" className="h-8">Refresh</Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInsights ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : aiInsights ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="min-w-[4px] bg-green-500 rounded-full" />
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Tip</p>
                      <p className="text-sm text-gray-800">{aiInsights.personalizedTip}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="min-w-[4px] bg-purple-500 rounded-full" />
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Analysis</p>
                      <p className="text-sm text-gray-800">{aiInsights.progressAnalysis}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4">
                  <Button onClick={generateInsights}>Activate AI Coach</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Quick Actions (Updated) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/workouts">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-purple w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Start Workout</h3>
                <p className="text-sm text-gray-600">Log activity</p>
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
                <p className="text-sm text-gray-600">Find recipes</p>
              </CardContent>
            </Card>
          </Link>

          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 border-purple-200 hover:border-fitfusion-purple">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Scan Meal</h3>
                  <p className="text-sm text-gray-600">AI Calorie Tracker</p>
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
                <FoodCamera onCapture={handleCapture} onClose={() => setIsScannerOpen(false)} />
              )}
            </DialogContent>
          </Dialog>

          <Link to="/community">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-fitfusion-orange w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-gray-600">Connect & Share</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
