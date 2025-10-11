
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { logOut } from '@/integrations/firebase/auth';
import { UserData, UserProfile, UserContextProps, initialUserData } from './UserContextTypes';
import { fetchProfile, updateUserProfile } from './UserContextHooks';

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null); // Keep for compatibility
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user?.email);
          setUser(user);
          setSession(user ? { user } : null); // Create session-like object for compatibility
          
          if (user) {
            setTimeout(() => {
              fetchProfile(user.uid, setProfile, setUserData);
            }, 0);
          } else {
            setProfile(null);
          }
        });
        
        const savedData = localStorage.getItem('fitfusion-user-prefs');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.lastLogin) {
              parsedData.lastLogin = new Date(parsedData.lastLogin);
            }
            setUserData(prevData => ({ ...prevData, ...parsedData }));
          } catch (error) {
            console.error('Error parsing saved user data:', error);
          }
        }
        
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing user context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('fitfusion-user-prefs', JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  }, [userData, isLoading]);

  const updateUserData = async (data: Partial<UserData>) => {
    setUserData(prevData => {
      const newData = { ...prevData, ...data };
      updateUserProfile(user, profile, data);
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

export * from './UserContextTypes';
