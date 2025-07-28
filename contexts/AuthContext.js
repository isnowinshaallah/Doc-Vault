import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../components/firebaseConfig'; // Adjust path as needed


const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const registerForPushNotificationsAsync = async () => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    return token;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    const getPushToken = async () => {
    try {
      if (user) {
        const token = await registerForPushNotificationsAsync();
        // Optional: Save token in Firestore under the user's profile
        console.log("Push token for user:", token);
      }
    } catch (error) {
      console.error('Failed to get push token:', error);
    }
  };
   const checkLoginStatus = async () => {
    try {
      // Delay splash until all is done
      await SplashScreen.preventAutoHideAsync();

      const storedUser = await SecureStore.getItemAsync('user');
      const biometricSetting = await SecureStore.getItemAsync('biometricEnabled');

      if (storedUser) {
        // Only prompt for biometric if user enabled it
        if (biometricSetting === 'true') {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate with Biometrics',
          });

          if (result.success) {
            setUser(JSON.parse(storedUser));
          } else {
            // Optionally: show error or just stop here
            console.log('Biometric failed');
            setUser(null); // Prevent auto-login
          }
        } else {
          // Biometrics not enabled – just proceed
          setUser(JSON.parse(storedUser));
        }
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
      await SplashScreen.hideAsync();
    }
  };
  
   if (user) {
    scheduleNotificationsForExpiringDocs(user.uid);
  }

  checkLoginStatus();
  checkAuthState();
  getPushToken();
}, [user]);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('firebase login failed, error');
      throw new Error('Login failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Firebase Google auth will be integrated here
      const result = await Google.logInAsync({
      clientId: '383838393767-0pb9js83pcq6b5t8b7i07127jg7mguv3.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });

    if (result.type === 'success') {
      const { idToken } = result;
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const userData = {
        id: userCredential.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || 'Google User',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error('Google Sign-In cancelled');
    }
  } catch (error) {
    console.error('Google login failed:', error);
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