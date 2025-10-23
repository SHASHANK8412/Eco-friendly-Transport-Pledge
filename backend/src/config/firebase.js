import admin from 'firebase-admin';

export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    // Validate required environment variables
    const requiredEnvVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all Firebase credentials are set.'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    
    console.log('Firebase Admin initialized with project:', process.env.FIREBASE_PROJECT_ID);
  }
  return admin;
};