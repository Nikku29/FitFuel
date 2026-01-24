import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { logOut } from '@/integrations/firebase/auth';
import { UserData, UserProfile, UserContextProps, initialUserData } from './UserContextTypes';
import { fetchProfile } from './UserContextHooks';
// Import createProfile to fix missing accounts
import { createProfile } from '@/integrations/firebase/firestore';

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
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          console.log('Auth state changed:', currentUser?.email);
          setUser(currentUser);
          setSession(currentUser ? { user: currentUser } : null);

          if (currentUser) {
            // 1. Try to fetch the profile
            await fetchProfile(currentUser.uid, async (fetchedProfile) => {

              // === SELF-HEALING LOGIC START ===
              if (!fetchedProfile) {
                console.warn("User logged in but no DB Profile found. Auto-creating...");

                const newProfile = {
                  id: currentUser.uid,
                  email: currentUser.email || "",
                  full_name: currentUser.displayName || "New User",
                  username: currentUser.email?.split('@')[0] || "user",
                  created_at: new Date(),
                  updated_at: new Date(),
                  // Default generic values so the app doesn't crash
                  fitness_goal: "General Fitness",
                  fitness_level: "Beginner",
                  diet_preference: "Vegetarian"
                };

                // Create it in Firestore immediately
                await createProfile(currentUser.uid, newProfile);

                // Set local state immediately so UI updates
                setProfile(newProfile as any);
                setUserData(prev => ({
                  ...prev,
                  name: newProfile.full_name,
                  tier: 'FREE',
                  credits: 0
                }));
                return;
              }
              // === SELF-HEALING LOGIC END ===

              setProfile(fetchedProfile);
              setUserData(prev => ({
                ...prev,
                tier: fetchedProfile.tier || 'FREE',
                credits: fetchedProfile.credits || 0
              }));
            }, setUserData);
          } else {
            setProfile(null);
            setUserData(initialUserData);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing user context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const updateUserData = async (data: Partial<UserData>) => {
    // Safety check: Don't update if no user logged in
    if (!user) return;

    setUserData(prevData => {
      const newData = { ...prevData, ...data };
      // Fire and forget update (handled in hooks)
      import('./UserContextHooks').then(({ updateUserProfile }) => {
        updateUserProfile(user, profile, data).catch(err => {
          console.error("Failed to save profile:", err);
          // If permission denied (missing doc), try creating it
          if (String(err).includes("permission")) {
            createProfile(user.uid, { full_name: data.name });
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