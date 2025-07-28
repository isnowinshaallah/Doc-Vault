// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZaeoYZizkYLCueZwSB_WaBD2UrTsYXxA",
  authDomain: "id-vault-60b65.firebaseapp.com",
  projectId: "id-vault-60b65",
  storageBucket: "id-vault-60b65.firebasestorage.app",
  messagingSenderId: "801199036847",
  appId: "1:801199036847:web:b803aae0be992f7540375a",
};

const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export {auth, db };
export const storage = getStorage(app);


