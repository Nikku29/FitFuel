/**
 * FitFuel - MoE State Management
 * React Context and Hooks for Mixture of Experts Orchestration
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { MoEResponse, moeOrchestrator } from '@/services/moeOrchestrator';

interface MoEState {
  activeWorkflows: Map<string, {
    id: string;
    status: 'idle' | 'running' | 'completed' | 'error';
    results: MoEResponse[];
    error?: string;
    progress: number;
  }>;
  globalMemory: Record<string, any>;
}

type MoEAction =
  | { type: 'START_WORKFLOW'; payload: { workflowId: string } }
  | { type: 'UPDATE_WORKFLOW'; payload: { workflowId: string; results: MoEResponse[]; progress: number } }
  | { type: 'COMPLETE_WORKFLOW'; payload: { workflowId: string; results: MoEResponse[] } }
  | { type: 'ERROR_WORKFLOW'; payload: { workflowId: string; error: string } }
  | { type: 'CLEAR_WORKFLOW'; payload: { workflowId: string } }
  | { type: 'UPDATE_MEMORY'; payload: { key: string; value: any } };

const initialState: MoEState = {
  activeWorkflows: new Map(),
  globalMemory: {}
};

function moeReducer(state: MoEState, action: MoEAction): MoEState {
  switch (action.type) {
    case 'START_WORKFLOW': {
      const newWorkflows = new Map(state.activeWorkflows);
      newWorkflows.set(action.payload.workflowId, {
        id: action.payload.workflowId,
        status: 'running',
        results: [],
        progress: 0
      });
      return { ...state, activeWorkflows: newWorkflows };
    }

    case 'UPDATE_WORKFLOW': {
      const updatedWorkflows = new Map(state.activeWorkflows);
      const existing = updatedWorkflows.get(action.payload.workflowId);
      if (existing) {
        updatedWorkflows.set(action.payload.workflowId, {
          ...existing,
          results: action.payload.results,
          progress: action.payload.progress
        });
      }
      return { ...state, activeWorkflows: updatedWorkflows };
    }

    case 'COMPLETE_WORKFLOW': {
      const completedWorkflows = new Map(state.activeWorkflows);
      const completed = completedWorkflows.get(action.payload.workflowId);
      if (completed) {
        completedWorkflows.set(action.payload.workflowId, {
          ...completed,
          status: 'completed',
          results: action.payload.results,
          progress: 100
        });
      }
      return { ...state, activeWorkflows: completedWorkflows };
    }

    case 'ERROR_WORKFLOW': {
      const errorWorkflows = new Map(state.activeWorkflows);
      const errored = errorWorkflows.get(action.payload.workflowId);
      if (errored) {
        errorWorkflows.set(action.payload.workflowId, {
          ...errored,
          status: 'error',
          error: action.payload.error
        });
      }
      return { ...state, activeWorkflows: errorWorkflows };
    }

    case 'CLEAR_WORKFLOW': {
      const clearedWorkflows = new Map(state.activeWorkflows);
      clearedWorkflows.delete(action.payload.workflowId);
      return { ...state, activeWorkflows: clearedWorkflows };
    }

    case 'UPDATE_MEMORY':
      return {
        ...state,
        globalMemory: {
          ...state.globalMemory,
          [action.payload.key]: action.payload.value
        }
      };

    default:
      return state;
  }
}

interface MoEContextType {
  state: MoEState;
  executeWorkflow: (workflowId: string, prompt: string, maxIterations?: number) => Promise<MoEResponse[]>;
  getWorkflowStatus: (workflowId: string) => MoEState['activeWorkflows'][0] | undefined;
  clearWorkflow: (workflowId: string) => void;
  updateGlobalMemory: (key: string, value: any) => void;
  getGlobalMemory: (key: string) => any;
}

const MoEContext = createContext<MoEContextType | undefined>(undefined);

export const MoEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(moeReducer, initialState);

  const executeWorkflow = useCallback(async (
    workflowId: string,
    prompt: string,
    maxIterations: number = 5
  ): Promise<MoEResponse[]> => {
    dispatch({ type: 'START_WORKFLOW', payload: { workflowId } });

    try {
      const results = await moeOrchestrator.executeWorkflow(workflowId, prompt, maxIterations);

      // Update progress incrementally (simulate for now)
      for (let i = 0; i < results.length; i++) {
        setTimeout(() => {
          dispatch({
            type: 'UPDATE_WORKFLOW',
            payload: {
              workflowId,
              results: results.slice(0, i + 1),
              progress: ((i + 1) / results.length) * 100
            }
          });
        }, (i + 1) * 500); // Stagger updates
      }

      dispatch({ type: 'COMPLETE_WORKFLOW', payload: { workflowId, results } });
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'ERROR_WORKFLOW', payload: { workflowId, error: errorMessage } });
      throw error;
    }
  }, []);

  const getWorkflowStatus = useCallback((workflowId: string) => {
    return state.activeWorkflows.get(workflowId);
  }, [state.activeWorkflows]);

  const clearWorkflow = useCallback((workflowId: string) => {
    dispatch({ type: 'CLEAR_WORKFLOW', payload: { workflowId } });
  }, []);

  const updateGlobalMemory = useCallback((key: string, value: any) => {
    dispatch({ type: 'UPDATE_MEMORY', payload: { key, value } });
  }, []);

  const getGlobalMemory = useCallback((key: string) => {
    return state.globalMemory[key];
  }, [state.globalMemory]);

  const value: MoEContextType = {
    state,
    executeWorkflow,
    getWorkflowStatus,
    clearWorkflow,
    updateGlobalMemory,
    getGlobalMemory
  };

  return (
    <MoEContext.Provider value={value}>
      {children}
    </MoEContext.Provider>
  );
};

export const useMoE = (): MoEContextType => {
  const context = useContext(MoEContext);
  if (!context) {
    throw new Error('useMoE must be used within a MoEProvider');
  }
  return context;
};

// Specialized hooks for common MoE operations
export const useNutritionAnalysis = () => {
  const { executeWorkflow, getWorkflowStatus } = useMoE();

  const analyzeImage = useCallback(async (imageData: string) => {
    const workflowId = `nutrition-${Date.now()}`;
    const prompt = `Analyze this food image and provide nutritional information. Image data: ${imageData}`;
    return executeWorkflow(workflowId, prompt);
  }, [executeWorkflow]);

  return { analyzeImage, getWorkflowStatus };
};

export const useWorkoutPlanning = () => {
  const { executeWorkflow, getWorkflowStatus } = useMoE();

  const createPlan = useCallback(async (userProfile: any) => {
    const workflowId = `workout-${Date.now()}`;
    const prompt = `Create a personalized workout plan for: ${JSON.stringify(userProfile)}`;
    return executeWorkflow(workflowId, prompt);
  }, [executeWorkflow]);

  return { createPlan, getWorkflowStatus };
};

export const useGeneralQuery = () => {
  const { executeWorkflow, getWorkflowStatus } = useMoE();

  const processQuery = useCallback(async (query: string) => {
    const workflowId = `query-${Date.now()}`;
    return executeWorkflow(workflowId, query);
  }, [executeWorkflow]);

  return { processQuery, getWorkflowStatus };
};