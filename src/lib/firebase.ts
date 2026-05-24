import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Support both environment variables (for production Cloudflare Pages) and local asset config fallback
let firebaseConfig: any = null;

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  console.log("Firebase initialized from production environment variables (VITE_FIREBASE_*).");
} else {
  try {
    // @ts-ignore
    import config from '../../firebase-applet-config.json';
    firebaseConfig = config;
    console.log("Firebase initialized from local json configuration asset.");
  } catch (e) {
    console.warn("Firebase config not found. Please complete Firebase setup or set environment variables.");
  }
}

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export const isFirebaseReady = !!app;
