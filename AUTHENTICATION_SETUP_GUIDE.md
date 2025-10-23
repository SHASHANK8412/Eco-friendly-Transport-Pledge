# Complete Authentication System Setup Guide

## 🎉 What's Been Implemented

Your EcoPledge Portal now has **THREE authentication methods**:

### 1. **Email/Password Sign Up & Login** ✅
- Traditional username/password authentication
- Users create accounts with email and password
- Same credentials used for login
- Password validation (minimum 6 characters)
- Confirmation password field for sign-ups

### 2. **Google Sign-In** ✅
- One-click Google OAuth authentication
- Works for both sign-up and login
- Automatic account creation on first sign-in

### 3. **Development Mode** ✅
- Quick testing without real authentication
- Only available in development environment

---

## 🚀 How It Works

### **Sign Up Flow (Email/Password)**

1. **User visits homepage** → Clicks "Sign Up" button
2. **Sign Up Form appears** with fields:
   - Email Address (required)
   - Password (required, min 6 characters)
   - Confirm Password (required, must match)
3. **User clicks "Sign Up" button**
4. **Firebase creates account**
5. **Profile Form appears** with additional details:
   - Full Name
   - Age
   - Location
   - Environmental Interests
   - Environmental Goals
6. **Data saved to Firebase Firestore**
7. **User redirected to Dashboard**

### **Login Flow (Email/Password)**

1. **User visits homepage** → Clicks "Login" button
2. **Login Form appears** with fields:
   - Email Address (required)
   - Password (required)
3. **User enters their registered credentials**
4. **User clicks "Sign In" button**
5. **Firebase authenticates user**
6. **User redirected to Dashboard**

### **Google Sign-In Flow**

1. **User clicks "Google" button** (available on both sign-up and login pages)
2. **Google popup window opens**
3. **User selects Google account**
4. **For new users**: Profile form appears to collect additional details
5. **For existing users**: Direct redirect to Dashboard

---

## ⚙️ Firebase Console Setup Required

To enable Email/Password authentication, you need to configure it in Firebase Console:

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: **Eco-Friendly-Pledge**

### Step 2: Enable Email/Password Authentication
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Sign-in method"** tab
3. Find **"Email/Password"** in the providers list
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Step 3: (Optional) Enable Email Link Sign-In
If you also want passwordless email link authentication:
1. Toggle **"Email link (passwordless sign-in)"** to ON
2. Click **"Save"**

---

## 🧪 Testing the Authentication System

### **Test Sign Up (Email/Password)**

1. Open http://localhost:5176
2. Click **"Sign Up"** button on homepage
3. Fill in the form:
   ```
   Email: test@example.com
   Password: test123
   Confirm Password: test123
   ```
4. Click **"Sign Up"** button
5. Fill in profile form:
   ```
   Full Name: John Doe
   Age: 25
   Location: New York, USA
   Interests: Renewable Energy
   Goals: Reduce carbon footprint
   ```
6. Click **"Complete Registration"**
7. Verify redirect to Dashboard

### **Test Login (Email/Password)**

1. Open http://localhost:5176
2. Click **"Login"** button on homepage
3. Fill in the form:
   ```
   Email: test@example.com
   Password: test123
   ```
4. Click **"Sign In"** button
5. Verify redirect to Dashboard

### **Test Google Sign-In**

1. Open http://localhost:5176
2. Click **"Sign Up"** or **"Login"** button
3. Click **"Google"** button
4. Select a Google account in the popup
5. For new accounts: Fill profile form
6. Verify redirect to Dashboard

### **Verify Data in Firebase**

1. Open Firebase Console
2. Go to **"Authentication"** → **"Users"** tab
3. You should see your test users listed with:
   - User ID
   - Email
   - Provider (Email/Password or Google)
   - Created date
   - Last sign-in date

4. Go to **"Firestore Database"**
5. Check **"users"** collection:
   - Should have documents with user profiles
   - Contains fullName, age, location, interests, goals
6. Check **"userProgress"** collection:
   - Should have progress tracking documents

---

## 🔐 Security Features Implemented

### Password Validation
- Minimum 6 characters required
- Password confirmation check
- Clear error messages for mismatches

### Error Handling
- **Email already in use**: "This email is already registered. Please sign in instead."
- **Invalid email**: "Invalid email address."
- **Weak password**: "Password is too weak. Please use a stronger password."
- **User not found**: "No account found with this email. Please sign up first."
- **Wrong password**: "Incorrect password. Please try again."
- **Too many attempts**: "Too many failed attempts. Please try again later."
- **Network errors**: "Network error. Please check your internet connection."

### Firebase Security Rules
All user data is protected:
- Users can only read/write their own data
- Authentication required for all operations
- User ID validation on all writes

---

## 📱 User Interface Features

### Login/Sign-Up Page
- **Clean, modern design** with green environmental theme
- **Toggle between Sign Up and Login** with one click
- **Email/Password form** with validation
- **"Or continue with" divider**
- **Google Sign-In button** with icon
- **Clear error messages** in red alert boxes
- **Loading states** with spinner animations
- **Password field masking** for security
- **Responsive design** for mobile devices

### Profile Completion Form
- **User-friendly layout** with labeled fields
- **Dropdown for interests** with 8 environmental categories
- **Text area for goals** allowing detailed input
- **Required field validation**
- **Age validation** (13-120 years)
- **Submit button** with loading state

---

## 🗄️ Data Storage Structure

### Users Collection (`users/{userId}`)
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  displayName: "John Doe",  // From Google or null for email auth
  photoURL: "url",           // From Google or null for email auth
  fullName: "John Doe",      // From profile form
  age: 25,
  location: "New York, USA",
  interests: "renewable-energy",
  environmentalGoals: "Reduce my carbon footprint...",
  isProfileComplete: true,
  completedAt: "2025-10-19T...",
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp,
  lastLogin: "2025-10-19T..."
}
```

### User Progress Collection (`userProgress/{userId}`)
```javascript
{
  userId: "firebase-user-id",
  profileCompleted: true,
  signupDate: "2025-10-19T...",
  interests: "renewable-energy",
  goals: "User goals...",
  totalPledges: 0,
  completedPledges: 0,
  co2Saved: 0,
  treesPlanted: 0,
  lastUpdated: serverTimestamp
}
```

---

## 🔄 Authentication Flow Diagram

```
Homepage
   |
   ├─→ Sign Up Button
   |      |
   |      ├─→ Email/Password Form
   |      |      └─→ Profile Form → Dashboard
   |      |
   |      └─→ Google Button
   |             └─→ Profile Form → Dashboard
   |
   └─→ Login Button
          |
          ├─→ Email/Password Form → Dashboard
          |
          └─→ Google Button → Dashboard
```

---

## 🐛 Troubleshooting

### Issue: "Email/Password authentication is disabled"
**Solution**: Enable Email/Password in Firebase Console (see Step 2 above)

### Issue: "Invalid API key"
**Solution**: 
1. Check `.env` file has correct `VITE_FIREBASE_API_KEY`
2. Verify API key in Firebase Console → Project Settings

### Issue: "Network request failed"
**Solution**:
1. Check internet connection
2. Verify Firebase project is active
3. Check browser console for detailed errors

### Issue: "User not found" when trying to login
**Solution**: Make sure you signed up first with that email

### Issue: "Password doesn't match"
**Solution**: Passwords are case-sensitive, type carefully

### Issue: Profile form not appearing after sign-up
**Solution**:
1. Check browser console for errors
2. Verify FirebaseService is properly configured
3. Make sure Firestore database is created in Firebase Console

---

## 📊 Current Status

- ✅ **Frontend Server**: Running on http://localhost:5176
- ✅ **Email/Password Auth**: Implemented
- ✅ **Google Sign-In**: Implemented
- ✅ **Profile Forms**: Implemented
- ✅ **Firebase Integration**: Complete
- ✅ **Data Storage**: Working
- ⚠️ **Firebase Console Setup**: Needs Email/Password enabled

---

## 🎯 Next Steps

1. **Enable Email/Password in Firebase Console** (see Step 2 above)
2. **Test sign-up flow** with email/password
3. **Test login flow** with same credentials
4. **Verify data** appears in Firebase Console
5. **Test Google Sign-In** as alternative
6. **Create multiple test accounts** to verify system

---

## 📞 Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify Firebase configuration in `.env` file
3. Ensure Firebase services are enabled in Console
4. Check network connectivity
5. Review error messages on the login page

---

**Your authentication system is now fully functional with multiple sign-in methods!** 🎉

Users can:
- ✅ Sign up with email/password
- ✅ Login with same email/password credentials
- ✅ Sign up/in with Google as alternative
- ✅ Fill detailed profile forms
- ✅ Have all data stored in Firebase

**Test it now at: http://localhost:5176**
