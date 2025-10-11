
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileStats: React.FC = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-t-lg">
        <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Your Stats</CardTitle>
        <CardDescription>Workout and activity statistics</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Workout History</h3>
            <p className="text-gray-600 text-sm mt-2">
              Complete workouts to see your stats here!
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <span className="text-gray-700 font-medium">Total Workouts</span>
              <span className="font-bold text-purple-600">0</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <span className="text-gray-700 font-medium">Total Minutes</span>
              <span className="font-bold text-orange-600">0</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
              <span className="text-gray-700 font-medium">Calories Burned</span>
              <span className="font-bold text-green-600">0</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <span className="text-gray-700 font-medium">Member Since</span>
              <span className="font-bold text-blue-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
