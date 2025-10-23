# Firestore Security Rules

Copy these rules to your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // User Progress collection - users can read/write their own progress
    match /userProgress/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Pledges collection - users can read all, but only write their own
    match /pledges/{pledgeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Certificates collection - users can read all, but only write their own
    match /certificates/{certificateId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // AI Interactions collection - users can read/write their own interactions
    match /aiInteractions/{interactionId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Public statistics - everyone can read, only admins can write
    match /statistics/{statsId} {
      allow read: if true;
      allow write: if false; // Only server-side updates
    }
  }
}
```

## How to Apply These Rules:

1. Go to https://console.firebase.google.com/
2. Select your project: **eco-friendly-pledge**
3. Click **"Firestore Database"** in the left sidebar
4. Click the **"Rules"** tab at the top
5. Replace the existing rules with the rules above
6. Click **"Publish"**

## Current Rules Status

If you're getting permission denied errors, you might have the default rules which block all access. The rules above will allow:

- ✅ Users to create and read their own user document
- ✅ Users to update their own profile
- ✅ Users to track their own progress
- ✅ Users to create and manage their own pledges
- ✅ Users to read other users' pledges (for community features)
- ✅ Users to generate and view certificates

## Testing Rules

After applying the rules, test with:

1. Sign up with a new account
2. Check browser console for any "permission-denied" errors
3. Check Firebase Console → Firestore Database
4. You should see documents appearing in:
   - `users/{userId}`
   - `userProgress/{userId}`
