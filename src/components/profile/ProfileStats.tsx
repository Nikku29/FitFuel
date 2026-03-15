

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import { agenticEngine } from '@/services/AgenticEngine';
import { db } from '@/integrations/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const ProfileStats: React.FC = () => {
  const { user, userData } = useUser();
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        console.log("Refreshing Dashboard via AI...");
        // Use userData (Profile) for the AI, not the Auth user object
        const newDashboard = await agenticEngine.runWorkflow(userData, 'update_dashboard');

        if (newDashboard) {
          setDashboardData(newDashboard);
          // Write to Firestore logic
          await setDoc(doc(db, 'users', user.uid, 'dashboard', 'daily'), newDashboard, { merge: true });
        }
      } catch (e) {
        console.error("Dashboard Update Failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, userData]);

  if (!dashboardData && loading) return <div className="p-6 text-center">Loading AI Insights...</div>;
  if (!dashboardData) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-t-lg">
        <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Daily Focus</CardTitle>
        <CardDescription>{dashboardData.motivationalMessage || "Your daily fitness summary"}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {/* PROGRESS / TIP */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="text-sm text-blue-800 font-medium">💡 Coach Tip: {dashboardData.personalizedTip}</div>
          <div className="text-xs text-blue-600 mt-1">Recommended: {dashboardData.recommendedAction}</div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
            <div className="text-2xl font-bold text-orange-600">{dashboardData.caloriesBurnedTarget}</div>
            <div className="text-xs text-orange-400 uppercase font-bold">Calorie Target</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.macroSplit?.protein}g / {dashboardData.macroSplit?.carbs}g / {dashboardData.macroSplit?.fat}g
            </div>
            <div className="text-xs text-green-400 uppercase font-bold">Macros (P/C/F)</div>
          </div>
        </div>

        {/* MEAL SUGGESTIONS */}
        <div>
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Meal Ideas</h4>
          <div className="space-y-2">
            {dashboardData.suggestedMealCards?.map((meal: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700">{meal.title}</span>
                <span className="text-gray-500">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ProfileStats;
