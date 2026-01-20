
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Utensils, Zap, Activity } from 'lucide-react';

interface NutritionData {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
}

interface CalorieAnalysisResultProps {
    data: NutritionData;
    onReset: () => void;
    onLog: () => void;
}

const CalorieAnalysisResult: React.FC<CalorieAnalysisResultProps> = ({ data, onReset, onLog }) => {
    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <Card className="overflow-hidden border-2 border-purple-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Detected</p>
                            <CardTitle className="text-2xl font-bold capitalize">{data.foodName}</CardTitle>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                            {(data.confidence * 100).toFixed(0)}% Match
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Main Calorie Display */}
                    <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-center">
                            <span className="text-4xl font-extrabold text-slate-800">{data.calories}</span>
                            <span className="text-slate-500 ml-2 text-sm uppercase font-semibold">Kcal</span>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Protein
                            </div>
                            <p className="text-xl font-bold text-slate-800">{data.protein}g</p>
                            <Progress value={40} className="h-1.5 bg-blue-100 [&>div]:bg-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Carbs
                            </div>
                            <p className="text-xl font-bold text-slate-800">{data.carbs}g</p>
                            <Progress value={60} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Fat
                            </div>
                            <p className="text-xl font-bold text-slate-800">{data.fat}g</p>
                            <Progress value={30} className="h-1.5 bg-yellow-100 [&>div]:bg-yellow-500" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button onClick={onReset} variant="outline" className="flex-1">
                            Retake
                        </Button>
                        <Button onClick={onLog} className="flex-1 bg-purple-600 hover:bg-purple-700">
                            Log Meal
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CalorieAnalysisResult;
