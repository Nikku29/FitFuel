/**
 * FitFuel - MoE Integration Example
 * Demonstrates how to use the Mixture of Experts system in React components
 */

import React, { useState, useEffect } from 'react';
import { useMoE, useNutritionAnalysis, useWorkoutPlanning } from '@/contexts/MoEContext';
import { MoEResponse } from '@/services/moeOrchestrator';
import { processMoEWorkflow } from '@/services/moeApiOrchestrator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Camera, Calculator, Database } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface MoEDemoProps {
  className?: string;
}

export const MoEDemo: React.FC<MoEDemoProps> = ({ className }) => {
  const { user } = useUser();
  const { executeWorkflow } = useMoE();
  const { analyzeImage } = useNutritionAnalysis();
  const { createPlan } = useWorkoutPlanning();

  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [results, setResults] = useState<MoEResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Analyze nutrition from image
  const handleNutritionAnalysis = async () => {
    if (!user?.id) return;

    setIsProcessing(true);
    setError(null);
    setActiveWorkflow('nutrition-analysis');

    try {
      // Simulate image data (in real app, this would come from camera/file upload)
      const mockImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...";

      const workflowResults = await analyzeImage(mockImageData);
      setResults(workflowResults);

      // Process results and save to database
      if (user.id) {
        await processMoEWorkflow(workflowResults, user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsProcessing(false);
      setActiveWorkflow(null);
    }
  };

  // Example: Create workout plan
  const handleWorkoutPlanning = async () => {
    if (!user?.id) return;

    setIsProcessing(true);
    setError(null);
    setActiveWorkflow('workout-planning');

    try {
      const userProfile = {
        age: 30,
        weight: 75,
        height: 175,
        fitness_level: 'intermediate',
        goals: 'build muscle',
        available_equipment: ['dumbbells', 'barbell', 'bench']
      };

      const workflowResults = await createPlan(userProfile);
      setResults(workflowResults);

      // Process results and save to database
      if (user.id) {
        await processMoEWorkflow(workflowResults, user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Planning failed');
    } finally {
      setIsProcessing(false);
      setActiveWorkflow(null);
    }
  };

  // Example: General query processing
  const handleGeneralQuery = async (query: string) => {
    if (!user?.id || !query.trim()) return;

    setIsProcessing(true);
    setError(null);
    setActiveWorkflow('general-query');

    try {
      const workflowResults = await executeWorkflow(`query-${Date.now()}`, query);
      setResults(workflowResults);

      // Process results and save to database
      if (user.id) {
        await processMoEWorkflow(workflowResults, user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query processing failed');
    } finally {
      setIsProcessing(false);
      setActiveWorkflow(null);
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'reasoning': return <Brain className="w-4 h-4" />;
      case 'vision': return <Camera className="w-4 h-4" />;
      case 'logic': return <Calculator className="w-4 h-4" />;
      case 'structuring': return <Database className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'reasoning': return 'bg-purple-100 text-purple-800';
      case 'vision': return 'bg-blue-100 text-blue-800';
      case 'logic': return 'bg-green-100 text-green-800';
      case 'structuring': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Mixture of Experts (MoE) Demo
          </CardTitle>
          <CardDescription>
            Experience AI-powered fitness and nutrition analysis using specialized agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleNutritionAnalysis}
              disabled={isProcessing || !user?.id}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isProcessing && activeWorkflow === 'nutrition-analysis' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Analyze Food Image
            </Button>

            <Button
              onClick={handleWorkoutPlanning}
              disabled={isProcessing || !user?.id}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isProcessing && activeWorkflow === 'workout-planning' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              Create Workout Plan
            </Button>

            <Button
              onClick={() => handleGeneralQuery("What's my average daily calorie intake this week?")}
              disabled={isProcessing || !user?.id}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isProcessing && activeWorkflow === 'general-query' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Ask AI Assistant
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Agent Responses:</h3>
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(result.agent)}
                        <Badge className={getAgentColor(result.agent)}>
                          {result.agent.toUpperCase()}
                        </Badge>
                        <Badge variant={result.confidence > 0.8 ? "default" : "secondary"}>
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      {result.error && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                    </div>

                    <div className="text-sm">
                      {result.error ? (
                        <p className="text-red-600">{result.error}</p>
                      ) : (
                        <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {typeof result.output === 'string'
                            ? result.output
                            : JSON.stringify(result.output, null, 2)
                          }
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* MoE Architecture Explanation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">How MoE Works</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Reasoning Agent
                  </strong>
                  <p>Orchestrates workflow, decides next agent</p>
                </div>
                <div>
                  <strong className="flex items-center gap-1">
                    <Calculator className="w-3 h-3" /> Logic Agent
                  </strong>
                  <p>Math calculations, workout planning</p>
                </div>
                <div>
                  <strong className="flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Vision Agent
                  </strong>
                  <p>Food image analysis, portion estimation</p>
                </div>
                <div>
                  <strong className="flex items-center gap-1">
                    <Database className="w-3 h-3" /> Structuring Agent
                  </strong>
                  <p>Formats data for database storage</p>
                </div>
              </div>
              <p className="text-xs mt-3">
                <strong>Free Models:</strong> Using OpenRouter's free tier with specialized models for each agent type.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoEDemo;