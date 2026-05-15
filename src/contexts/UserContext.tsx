import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { logOut } from '@/integrations/firebase/auth';
import { UserData, UserProfile, UserContextProps, initialUserData } from './UserContextTypes';
import { fetchProfile } from './UserContextHooks';
import { createProfile } from '@/integrations/firebase/firestore';
import { CreditService } from '@/services/CreditService';

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      try {
        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession({ user: currentSession.user });
          await loadUserProfile(currentSession.user);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.email);
            const currentUser = newSession?.user ?? null;
            setUser(currentUser);
            setSession(currentUser ? { user: currentUser } : null);

            if (currentUser) {
              await loadUserProfile(currentUser);
            } else {
              setProfile(null);
              setUserData(initialUserData);
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing user context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const loadUserProfile = async (currentUser: User) => {
    await fetchProfile(currentUser.id, async (fetchedProfile) => {
      // === SELF-HEALING LOGIC START ===
      if (!fetchedProfile) {
        console.warn("User logged in but no DB Profile found. Auto-creating...");

        const newProfile = {
          id: currentUser.id,
          email: currentUser.email || "",
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "New User",
          username: currentUser.email?.split('@')[0] || "user",
          fitness_goal: "General Fitness",
          fitness_level: "Beginner",
          diet_preference: "Vegetarian"
        };

        // Create it in Supabase immediately
        await createProfile(currentUser.id, newProfile);

        // Initialize credits for new user
        try {
          await CreditService.initializeCredits(currentUser.id, 'FREE');
        } catch (creditError) {
          console.warn('Could not initialize credits:', creditError);
        }

        // Set local state immediately so UI updates
        setProfile(newProfile as any);
        setUserData(prev => ({
          ...prev,
          name: newProfile.full_name,
          tier: 'FREE',
          credits: 3
        }));
        return;
      }
      // === SELF-HEALING LOGIC END ===

      setProfile(fetchedProfile);
      
      // Initialize credits if not set (for existing users)
      const tier = fetchedProfile.tier || 'FREE';
      let credits = fetchedProfile.credits;
      if (credits === undefined || credits === null) {
        try {
          await CreditService.initializeCredits(currentUser.id, tier);
          credits = tier === 'PRO' ? -1 : 3;
        } catch (creditError) {
          console.warn('Could not initialize credits:', creditError);
          credits = tier === 'PRO' ? -1 : 0;
        }
      }
      
      setUserData(prev => ({
        ...prev,
        tier,
        credits: credits || 0
      }));
    }, setUserData);
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;

    setUserData(prevData => {
      const newData = { ...prevData, ...data };
      import('./UserContextHooks').then(({ updateUserProfile }) => {
        updateUserProfile(user, profile, data).catch(err => {
          console.error("Failed to save profile:", err);
          if (String(err).includes("permission") || String(err).includes("42501")) {
            createProfile(user.id, { full_name: data.name });
          }
        });
      });
      return newData;
    });
  };

  const clearUserData = async () => {
    try {
      await logOut();
      setUserData(initialUserData);
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem('fitfusion-user-prefs');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      userData,
      updateUserData,
      isLoading,
      clearUserData,
      user,
      profile,
      session
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};