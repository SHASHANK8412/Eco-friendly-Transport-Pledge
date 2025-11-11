// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDKQnbvoUXS8ZRooIY1rRLngM-XVVp3Etg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eco-friendly-pledge.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eco-friendly-pledge",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eco-friendly-pledge.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "778357402671",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:778357402671:web:9cb27f2a65bda5a4d23a11"
};


// Debug Firebase config
console.log('🔥 Firebase Config Debug:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  environment: import.meta.env.MODE
});

// Validate required Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("❌ FIREBASE CONFIG ERROR: Missing required Firebase configuration");
  console.error("Environment variables:", {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing'
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
