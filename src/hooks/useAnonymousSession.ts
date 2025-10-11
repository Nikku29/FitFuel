
import { useState, useEffect } from 'react';
import { 
  createAnonymousSession, 
  getAnonymousSession, 
  updateAnonymousSession,
  deleteAnonymousSession
} from '@/integrations/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface AnonymousUserData {
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: string;
  location?: string;
  diet_preference?: string;
  fitness_level?: string;
  fitness_goal?: string;
  allergies?: string;
  medical_conditions?: string;
  activity_restrictions?: string;
}

export const useAnonymousSession = () => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [anonymousData, setAnonymousData] = useState<AnonymousUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we already have a session token
    const existingToken = localStorage.getItem('anonymous-session-token');
    if (existingToken) {
      setSessionToken(existingToken);
      loadSessionData(existingToken);
    }
  }, []);

  const generateSessionToken = () => {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const loadSessionData = async (token: string) => {
    try {
      setIsLoading(true);
      const session = await getAnonymousSession(token);

      if (session) {
        setSessionId(session.id);
        setAnonymousData({
          height_cm: session.height_cm,
          weight_kg: session.weight_kg,
          age: session.age,
          gender: session.gender,
          location: session.location,
          diet_preference: session.diet_preference,
          fitness_level: session.fitness_level,
          fitness_goal: session.fitness_goal,
          allergies: session.allergies,
          medical_conditions: session.medical_conditions,
          activity_restrictions: session.activity_restrictions
        });
      } else {
        console.log('Session expired or not found, clearing local storage');
        localStorage.removeItem('anonymous-session-token');
        setSessionToken(null);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (userData: AnonymousUserData) => {
    setIsLoading(true);
    try {
      const token = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours
      
      const { id, error } = await createAnonymousSession({
        session_token: token,
        expires_at: expiresAt,
        ...userData
      });

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      setSessionToken(token);
      setSessionId(id);
      setAnonymousData(userData);
      localStorage.setItem('anonymous-session-token', token);
      
      return { success: true, data: { id, ...userData } };
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async (userData: Partial<AnonymousUserData>) => {
    if (!sessionId) return;

    try {
      const { error } = await updateAnonymousSession(sessionId, userData);

      if (error) throw error;

      setAnonymousData(prev => ({ ...prev, ...userData }));
      return { success: true, data: { ...anonymousData, ...userData } };
    } catch (error) {
      console.error('Error updating session:', error);
      return { success: false, error };
    }
  };

  const clearSession = async () => {
    if (sessionId) {
      await deleteAnonymousSession(sessionId);
    }
    setSessionToken(null);
    setSessionId(null);
    setAnonymousData(null);
    localStorage.removeItem('anonymous-session-token');
  };

  return {
    sessionToken,
    anonymousData,
    isLoading,
    createSession,
    updateSession,
    clearSession
  };
};
