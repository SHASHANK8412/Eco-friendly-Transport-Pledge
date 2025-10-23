# User Authentication & Data Storage Implementation

## Overview
The homepage has been updated with clear **Sign Up** and **Login** buttons that collect user information through forms and store all data in Firebase database.

## Homepage Features

### Main Hero Section
Located at the top of the homepage, users will see:
- **Sign Up** button (Green, Primary) - For new users
- **Login** button (White with green border) - For existing users

### How It Works

#### 1. New User Registration (Sign Up)
**Step 1: Click "Sign Up" Button**
- Located in the hero section
- Routes to: `/login?signup=true`

**Step 2: Google Authentication**
- User clicks "Sign up with Google"
- Google OAuth popup appears
- User authenticates with their Google account
- Firebase Authentication creates user account

**Step 3: Complete Profile Form**
After successful authentication, a profile form appears with:
- **Full Name** (text input, required)
- **Age** (number input, 13-120, required)
- **Location** (City, Country - text input, required)
- **Environmental Interests** (dropdown, required):
  - Renewable Energy
  - Sustainable Transportation
  - Waste Reduction
  - Water Conservation
  - Wildlife Protection
  - Climate Action
  - Organic Farming
  - Green Building
- **Environmental Goals** (textarea, required)

**Step 4: Data Storage**
All form data is automatically saved to Firebase Firestore in two collections:

##### Users Collection (`users`)
```javascript
{
  uid: "firebase-user-id",
  email: "user@email.com",
  displayName: "User Display Name",
  photoURL: "user-photo-url",
  fullName: "Complete User Name",
  age: 25,
  location: "New York, USA",
  interests: "renewable-energy",
  environmentalGoals: "Reduce carbon footprint...",
  isProfileComplete: true,
  completedAt: "2025-10-19T...",
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp,
  lastLogin: "2025-10-19T..."
}
```

##### User Progress Collection (`userProgress`)
```javascript
{
  userId: "firebase-user-id",
  profileCompleted: true,
  signupDate: "2025-10-19T...",
  interests: "renewable-energy",
  goals: "User's environmental goals",
  totalPledges: 0,
  completedPledges: 0,
  co2Saved: 0,
  treesPlanted: 0,
  lastUpdated: serverTimestamp
}
```

#### 2. Existing User Login
**Step 1: Click "Login" Button**
- Located in the hero section
- Routes to: `/login`

**Step 2: Google Authentication**
- User clicks "Sign in with Google"
- Google OAuth popup appears
- User authenticates with existing account

**Step 3: Automatic Redirect**
- User is redirected to Dashboard
- Last login time is updated in Firebase

## Additional Buttons on Homepage

### Call-to-Action Section
Large green section with buttons:
- **Sign Up Free** - Opens signup flow
- **Login** - Opens login flow

### Feature Cards (6 cards)
Each card has a button that routes users appropriately:
1. **AI Pledge Assistant** → Dashboard or Sign Up
2. **Track Your Impact** → Dashboard or Sign Up
3. **Get Certificates** → Certificate page or Sign Up
4. **Join Community** → Feedback page or Sign Up
5. **Share Feedback** → Feedback page or Sign Up
6. **Make Pledges** → Pledge page or Sign Up

### Quick Links Grid (4 buttons)
- **Certificates** → Certificate page or Sign Up
- **Feedback** → Feedback page or Sign Up
- **AI Assistant** → Dashboard or Sign Up
- **Track Progress** → Dashboard or Sign Up

## Firebase Collections Structure

### 1. Users Collection
**Path**: `users/{userId}`
**Purpose**: Store user profile information
**Fields**:
- uid (string) - Firebase user ID
- email (string) - User email
- displayName (string) - Display name
- photoURL (string) - Profile photo
- fullName (string) - Complete name
- age (number) - User age
- location (string) - City, Country
- interests (string) - Primary interest
- environmentalGoals (string) - User's goals
- isProfileComplete (boolean)
- completedAt (timestamp)
- createdAt (timestamp)
- updatedAt (timestamp)
- lastLogin (timestamp)

### 2. User Progress Collection
**Path**: `userProgress/{userId}`
**Purpose**: Track user achievements and progress
**Fields**:
- userId (string)
- profileCompleted (boolean)
- signupDate (timestamp)
- interests (string)
- goals (string)
- totalPledges (number)
- completedPledges (number)
- co2Saved (number)
- treesPlanted (number)
- lastUpdated (timestamp)

### 3. Pledges Collection
**Path**: `pledges/{pledgeId}`
**Purpose**: Store user pledges
**Created When**: User fills out pledge form
**Fields**:
- userId (string)
- userEmail (string)
- name (string)
- email (string)
- pledgeText (string)
- actions (array)
- rollNo (string)
- modeOfTransport (string)
- pledgeDate (string)
- location (object)
- createdAt (timestamp)
- updatedAt (timestamp)
- status (string)

### 4. Certificates Collection
**Path**: `certificates/{certificateId}`
**Purpose**: Store certificate metadata
**Fields**:
- userId (string)
- userEmail (string)
- certificateId (string)
- pledgeId (string)
- name (string)
- pledgeName (string)
- createdAt (timestamp)
- downloadCount (number)

### 5. AI Interactions Collection
**Path**: `aiInteractions/{interactionId}`
**Purpose**: Store AI chat history
**Fields**:
- userId (string)
- type (string)
- message (string)
- response (string)
- timestamp (timestamp)

## Security Rules

All data is protected by Firebase Security Rules:
- Users can only read/write their own data
- Authentication is required for all operations
- User ID validation on all writes

## Testing the Flow

### Prerequisites
1. Firebase project configured
2. Google Authentication enabled in Firebase Console
3. Development server running: `http://localhost:5175`

### Test Steps

**New User Registration:**
1. Visit http://localhost:5175
2. Click "Sign Up" button (green button in hero section)
3. Click "Sign up with Google" on the login page
4. Complete Google authentication
5. Fill out the profile form with all required fields
6. Click "Complete Registration"
7. Verify redirect to Dashboard

**Check Firebase Console:**
1. Open Firebase Console
2. Go to Firestore Database
3. Check `users` collection - should see new user document
4. Check `userProgress` collection - should see progress document
5. Verify all form data is stored correctly

**Existing User Login:**
1. Visit http://localhost:5175
2. Click "Login" button (white button in hero section)
3. Click "Sign in with Google"
4. Complete Google authentication
5. Verify redirect to Dashboard

## Error Handling

The system includes comprehensive error handling:
- **Network errors**: User-friendly messages
- **Authentication failures**: Specific error messages
- **Form validation**: Required field checks
- **Firebase errors**: Graceful degradation
- **Loading states**: Visual feedback during operations

## User Experience Features

1. **Loading States**: Spinner animations during auth and data saving
2. **Error Messages**: Clear, actionable error feedback
3. **Form Validation**: Real-time validation on all fields
4. **Mobile Responsive**: Works on all screen sizes
5. **Accessible**: Proper labels and ARIA attributes
6. **Visual Feedback**: Button states (hover, active, disabled)

## Technical Implementation

### Files Modified/Created:
1. `HomePage.jsx` - Updated with Sign Up/Login buttons
2. `LoginPage.jsx` - Enhanced with profile form
3. `UserOnboardingForm.jsx` - New component for detailed onboarding
4. `firebaseService.js` - Data storage methods
5. `AuthContext.jsx` - User authentication management

### Key Functions:
- `signInWithGoogle()` - Handle Google authentication
- `FirebaseService.createUser()` - Create user profile
- `FirebaseService.updateUser()` - Update user data
- `FirebaseService.updateUserProgress()` - Track progress

## Next Steps

After successful registration:
1. User is redirected to Dashboard
2. Can create pledges (stored in Firebase)
3. Can get certificates (stored in Firebase)
4. Can use AI assistant (interactions stored in Firebase)
5. All data is automatically synced

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Check browser console for debug logs
3. Verify Firebase environment variables
4. Ensure Google Auth is enabled in Firebase

---

**Status**: ✅ Fully Implemented and Working
**Server**: Running at http://localhost:5175
**Database**: Firebase Firestore
**Authentication**: Firebase Auth with Google OAuth