// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// For debugging - DO NOT use in production
console.log("Firebase configuration check:");
console.log("API Key available:", !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log("API Key value:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("Storage Bucket:", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log("Messaging Sender ID:", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log("App ID:", import.meta.env.VITE_FIREBASE_APP_ID);

// Validate required Firebase config
if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
  console.error("MISSING FIREBASE CONFIG: Please check your .env file and add valid Firebase configuration");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;