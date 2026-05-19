import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We wrap this in a way that doesn't crash if the file is missing during transition
let firebaseConfig;
try {
  // @ts-ignore
  import config from '../../firebase-applet-config.json';
  firebaseConfig = config;
} catch (e) {
  console.warn("Firebase config not found. Please complete Firebase setup.");
}

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export const isFirebaseReady = !!app;
