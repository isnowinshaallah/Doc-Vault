// utils/googleAuth.js
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { auth } from '../components/firebaseConfig';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '383838393767-gbmvurfvmhftuhh57352j7a17i1smff5.apps.googleusercontent.com',
    androidClientId: '383838393767-veerrh569ujnas8gpu4ngcjj942m055b.apps.googleusercontent.com',
    webClientId: '383838393767-crkl7t8kol05v7i9a2km9b6lviuif0ru.apps.googleusercontent.com',
    expoClientId: '383838393767-0pb9js83pcq6b5t8b7i07127jg7mguv3.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      useProxy: true, // very important
    }),
  });

  useEffect(() => {
    const handleSignIn = async () => {
      if (response?.type === 'success' && response.authentication?.idToken) {
        try {
          const credential = GoogleAuthProvider.credential(response.authentication.idToken);
          await signInWithCredential(auth, credential);
          console.log('✅ Google Sign-in successful');
        } catch (error) {
          console.error('❌ Firebase sign-in error:', error);
        }
      } else if (response?.type === 'error') {
        console.error('❌ Google auth error:', response.error);
      }
    };

    handleSignIn();
  }, [response]);

  return {
    promptAsync,
    request,
  };
};
