import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      
      if (!hasLaunchedBefore) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      } else {
        setIsFirstLaunch(false);
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Firebase auth will be integrated here
      const userData = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Firebase Google auth will be integrated here
      const userData = {
        id: Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error('Google login failed');
    }
  };

  const loginOffline = async () => {
    try {
      const userData = {
        id: 'offline-user',
        email: 'offline@local.com',
        name: 'Offline User',
        isOfflineMode: true,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error('Offline mode setup failed');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginOffline,
        logout,
        isFirstLaunch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};