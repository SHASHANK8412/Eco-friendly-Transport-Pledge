# Firebase Integration Setup Guide

This guide will walk you through connecting your Eco-Friendly Pledge project to Firebase.

## Prerequisites

- Firebase project created at https://console.firebase.google.com/
- Node.js and npm installed
- Project environment variables configured

## Step 1: Install Dependencies

### Frontend
```bash
cd frontend
npm install firebase
```

### Backend (if using Firebase Admin)
```bash
cd backend
npm install firebase-admin
```

## Step 2: Firebase Console Configuration

### 2.1 Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `eco-friendly-pledge`
3. Navigate to **Firestore Database**
4. Click "Create database"
5. Choose "Start in test mode" initially
6. Select a location (choose closest to your users)

### 2.2 Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your domain to authorized domains:
   - localhost (for development)
   - Your production domain

### 2.3 Enable Storage (Optional)
1. Go to **Storage**
2. Click "Get started"
3. Start in test mode
4. Choose a location

## Step 3: Apply Security Rules

### 3.1 Firestore Rules
1. In Firebase Console → **Firestore Database** → **Rules**
2. Copy the content from `firestore.rules` file
3. Click **Publish**

### 3.2 Storage Rules (if using Storage)
1. In Firebase Console → **Storage** → **Rules**
2. Copy the content from `storage.rules` file
3. Click **Publish**

## Step 4: Update Environment Variables

Ensure your `.env` files have the correct Firebase configuration:

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000
```

### Backend (.env) - If using Firebase Admin
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key_here"
FIREBASE_CLIENT_EMAIL=your_service_account_email
```

## Step 5: Test the Integration

### 5.1 Start Development Servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend (if still using for AI features)
cd backend
npm run dev
```

### 5.2 Test Authentication
1. Open the application in your browser
2. Try to sign in with Google
3. Check if user data is created in Firestore

### 5.3 Test Data Operations
1. Create a pledge
2. Check if it appears in Firestore `pledges` collection
3. Verify user-specific data isolation

## Step 6: Migration from Existing Data

If you have existing data in MongoDB or local storage:

### 6.1 Export Existing Data
```bash
# For MongoDB
mongoexport --collection=pledges --db=your_db_name --out=pledges.json

# For local storage - use browser dev tools to export
```

### 6.2 Import to Firestore
Use the Firebase Admin SDK or Firebase CLI to import data:

```javascript
// Example import script
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import pledges
const pledges = JSON.parse(fs.readFileSync('pledges.json', 'utf8'));
const batch = db.batch();

pledges.forEach((pledge) => {
  const docRef = db.collection('pledges').doc();
  batch.set(docRef, pledge);
});

batch.commit().then(() => {
  console.log('Data import completed');
});
```

## Step 7: Update Component Usage

The integration is already set up in your components:

### Key Components Updated:
- `AuthContext.jsx` - Firebase authentication
- `firebaseService.js` - Database operations
- `PledgeForm.jsx` - Uses Firebase for pledge creation
- `Dashboard.jsx` - Fetches data from Firebase
- `ProtectedRoute.jsx` - Firebase auth guards

### Usage Examples:

```javascript
// Creating a pledge
const pledge = await FirebaseService.createPledge(pledgeData);

// Getting user pledges
const pledges = await FirebaseService.getUserPledges();

// Saving AI interaction
await FirebaseService.saveAIInteraction({
  type: 'chat',
  message: 'User message',
  response: 'AI response'
});
```

## Step 8: Production Deployment

### 8.1 Update Security Rules
Change from test mode to production rules:

```javascript
// Instead of: allow read, write: if true;
// Use: allow read, write: if request.auth != null && request.auth.uid == userId;
```

### 8.2 Environment Variables
Set production environment variables in your hosting platform:
- Vercel, Netlify: Set in dashboard
- Heroku: Use `heroku config:set`

### 8.3 Authorized Domains
Add your production domain to Firebase Authentication authorized domains.

## Troubleshooting

### Common Issues:

1. **Authentication Popup Blocked**
   - Enable popups for your domain
   - Check browser settings

2. **Permission Denied**
   - Verify Firestore rules
   - Check user authentication status
   - Ensure user IDs match

3. **Environment Variables Not Loading**
   - Restart development server
   - Check .env file location
   - Verify variable names (VITE_ prefix for frontend)

4. **Firestore Rules Errors**
   - Check Firebase Console for rule errors
   - Test rules in Firebase Console simulator

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Test with Firebase Console data viewer

## Next Steps

After successful integration:
1. Implement real-time updates with Firestore listeners
2. Add offline support with Firebase persistence
3. Set up Firebase Cloud Functions for server-side logic
4. Implement push notifications with Firebase Messaging
5. Add analytics with Firebase Analytics