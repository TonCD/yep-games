import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config - Can use .env (optional) or hardcode (safe for Firebase)
// Using .env: Create .env file and add VITE_FIREBASE_* variables
// Hardcoding: Directly replace values below (Firebase API keys are designed to be public)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA1xQ3fidRxYeVDRYsr83Jh1y9g4XL-4Vs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yep-games.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yep-games",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yep-games.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "240769114628",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:240769114628:web:bae538b76b22fb509e8b51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
