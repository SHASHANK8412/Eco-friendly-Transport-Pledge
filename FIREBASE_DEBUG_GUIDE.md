# Firebase Data Storage Troubleshooting Guide

## Issue: Data Not Appearing in Firebase After Sign Up

### ✅ What I've Fixed:

1. **Updated FirebaseService to use correct document IDs**
   - Changed from `addDoc` (random IDs) to `setDoc` (using user UID)
   - User documents now stored at `users/{userId}` where userId = Firebase Auth UID
   - Progress documents stored at `userProgress/{userId}`

2. **Added error handling and logging**
   - Console logs now show when data is saved
   - Better error messages if something fails

3. **Fixed document creation logic**
   - Check if document exists before updating
   - Create with `setDoc` if doesn't exist
   - Update with `updateDoc` if exists

---

## 🔍 Debug Steps to Find the Issue:

### Step 1: Check Browser Console

1. Open http://localhost:5176
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try signing up with email/password
5. Look for these messages:

**Success messages you should see:**
```
Sign up successful: {user object}
User created successfully in Firestore with UID: abc123...
User profile data saved to Firebase
User progress updated successfully in Firestore: abc123...
```

**Error messages to look for:**
```
Error creating user in Firestore: [error details]
Error updating user progress in Firestore: [error details]
permission-denied: Missing or insufficient permissions
```

### Step 2: Check Firebase Authentication

1. Go to https://console.firebase.google.com/
2. Select **eco-friendly-pledge** project
3. Click **Authentication** → **Users** tab
4. You should see your test user with:
   - UID
   - Email address
   - Provider (Email/Password or Google)
   - Created date

**If user appears here:** Authentication is working ✅

### Step 3: Check Firestore Database

1. Go to https://console.firebase.google.com/
2. Select **eco-friendly-pledge** project
3. Click **Firestore Database**

**Check if database exists:**
- If you see "Create database" button → Click it and create database
- Choose "Start in test mode" for now (we'll secure it later)
- Select your region (closest to you)
- Click "Enable"

**If database exists, check collections:**
- Look for `users` collection
- Look for `userProgress` collection
- Click on each to see documents

**Expected structure:**
```
users/
  {userId}/
    uid: "abc123..."
    email: "user@example.com"
    fullName: "John Doe"
    age: 25
    location: "New York, USA"
    interests: "renewable-energy"
    environmentalGoals: "..."
    createdAt: Timestamp
    updatedAt: Timestamp

userProgress/
  {userId}/
    userId: "abc123..."
    profileCompleted: true
    signupDate: "2025-10-19..."
    interests: "renewable-energy"
    goals: "..."
    totalPledges: 0
    completedPledges: 0
    lastUpdated: Timestamp
```

### Step 4: Check Firestore Security Rules

1. In Firestore Database, click **Rules** tab
2. Check current rules

**If you see this (blocks everything):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Change to test mode (temporary):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then click **Publish**

**⚠️ IMPORTANT:** This allows any authenticated user to read/write anything. Use the proper rules from `FIRESTORE_SECURITY_RULES.md` for production!

### Step 5: Test the Full Flow

1. **Clear your browser cache and cookies**
   - Press Ctrl+Shift+Delete
   - Clear "Cookies and other site data"
   - Clear "Cached images and files"

2. **Open browser console** (F12)

3. **Sign up with a test account:**
   ```
   Email: test123@example.com
   Password: test123
   Confirm: test123
   ```

4. **Watch the console for messages**

5. **Fill the profile form:**
   ```
   Full Name: Test User
   Age: 25
   Location: Test City, Country
   Interests: Renewable Energy
   Goals: Testing the system
   ```

6. **Click "Complete Registration"**

7. **Check console for success messages**

8. **Go to Firebase Console** and verify data appears in:
   - Authentication → Users
   - Firestore Database → users collection
   - Firestore Database → userProgress collection

---

## 🐛 Common Issues and Solutions

### Issue: "permission-denied" error

**Solution 1:** Enable test mode in Firestore Rules (see Step 4)

**Solution 2:** Apply proper security rules from `FIRESTORE_SECURITY_RULES.md`

### Issue: "User not authenticated" error

**Problem:** User is trying to save data before Firebase Auth completes

**Solution:** The code already handles this, but if you see this error:
1. Check that Firebase Auth is properly initialized
2. Verify `.env` file has correct Firebase credentials
3. Restart the dev server: `npm run dev`

### Issue: Firestore database doesn't exist

**Solution:**
1. Go to Firebase Console
2. Click "Firestore Database"
3. Click "Create database"
4. Choose "Start in test mode"
5. Select your region
6. Click "Enable"

### Issue: Data appears in Authentication but not Firestore

**Possible causes:**
1. Firestore rules blocking writes (see Step 4)
2. JavaScript errors preventing data save (check console)
3. Network issues (check Network tab in Dev Tools)

**Solution:**
- Check browser console for errors
- Verify Firestore rules allow authenticated writes
- Check Network tab for failed requests (should show 403 if permissions issue)

### Issue: User UID is undefined

**Problem:** Trying to save data before Firebase returns user object

**Solution:** Already fixed in the code - we now check for `userData.uid` before creating

---

## 📊 What to Check in Firebase Console

### Authentication Tab
```
✅ User appears with email
✅ User has a UID
✅ Sign-in method shows (Email/Password or Google)
✅ Last sign-in time is recent
```

### Firestore Database Tab
```
✅ Database is created
✅ "users" collection exists
✅ User document exists at users/{userId}
✅ "userProgress" collection exists
✅ Progress document exists at userProgress/{userId}
✅ All fields are populated (not undefined)
✅ Timestamps are valid
```

---

## 🔧 Emergency Fix: Enable Test Mode

If nothing is working, temporarily use test mode:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click "Publish"
4. Try signing up again
5. If it works now, the issue was security rules
6. Apply proper rules from `FIRESTORE_SECURITY_RULES.md`

---

## 📝 Test Checklist

- [ ] Firebase project created
- [ ] Firestore database created
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled (optional)
- [ ] Firestore security rules set (at least test mode)
- [ ] `.env` file has correct Firebase config
- [ ] Dev server is running (npm run dev)
- [ ] Browser console shows no errors
- [ ] User appears in Authentication after sign up
- [ ] User document appears in Firestore users collection
- [ ] User progress appears in userProgress collection

---

## 🎯 Next Steps

1. Complete the checklist above
2. Try signing up with a new email
3. Check each step in Firebase Console
4. Share any error messages you see in the console
5. Let me know which step fails so I can help debug

---

**Server is running at: http://localhost:5176**

**Try signing up now and check your browser console (F12) for any error messages!**
