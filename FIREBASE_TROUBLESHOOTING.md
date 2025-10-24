# 🔥 Firebase Authentication Troubleshooting Guide

## ⚠️ **CRITICAL ISSUE IDENTIFIED**

The error `auth/invalid-credential` means Firebase cannot authenticate the user. Here's what to check:

---

## ✅ **STEP 1: Verify Firebase Console Settings**

### Go to: https://console.firebase.google.com/

1. **Select Project**: `eco-friendly-pledge`

2. **Authentication → Sign-in Method**
   - ✅ Ensure **Email/Password** is **ENABLED**
   - Click on it and verify:
     - ☑️ **Email/Password** is enabled
     - ☑️ **Email link (passwordless sign-in)** can be disabled

3. **Authentication → Settings → Authorized Domains**
   - Click **Add Domain** and add:
     ```
     eco-friendly-transport-pledge.vercel.app
     localhost
     ```

---

## ✅ **STEP 2: Add Environment Variables in Vercel**

### **CRITICAL**: Your `.env` file is NOT deployed!

Go to: https://vercel.com/dashboard

1. Select your project: **eco-friendly-transport-pledge**
2. Go to: **Settings** → **Environment Variables**
3. Add these variables (for **Production**, **Preview**, and **Development**):

```env
VITE_FIREBASE_API_KEY=AIzaSyDKQnbvoUXS8ZRooIY1rRLngM-XVVp3Etg
VITE_FIREBASE_AUTH_DOMAIN=eco-friendly-pledge.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eco-friendly-pledge
VITE_FIREBASE_STORAGE_BUCKET=eco-friendly-pledge.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=778357402671
VITE_FIREBASE_APP_ID=1:778357402671:web:9cb27f2a65bda5a4d23a11
VITE_API_URL=https://eco-friendly-transport-pledge.onrender.com
```

4. **Save** and **Redeploy** the project

---

## ✅ **STEP 3: Verify User Exists in Firebase**

1. Go to **Firebase Console** → **Authentication** → **Users**
2. Check if `kadimishashank@gmail.com` exists in the list
3. If it exists, check:
   - ✅ Provider shows "Email/Password"
   - ✅ User is not disabled
   - ✅ Created date is shown

---

## ✅ **STEP 4: Test Password Reset (if user exists)**

If the user exists but password is wrong:

1. On your login page, you can add a "Forgot Password" feature
2. Or manually reset in Firebase Console:
   - Click on the user
   - Click the 3 dots menu
   - Select "Reset password"
   - Firebase will send reset email

---

## ✅ **STEP 5: Create New Test User**

If uncertain, create a fresh test account:

1. On your deployed site: https://eco-friendly-transport-pledge.vercel.app/login
2. Click **"Sign Up"** (not Sign In)
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123456!
   - Confirm Password: Test123456!
4. Click **Create Account**

---

## 🔍 **Check Browser Console**

Open browser DevTools (F12) and check:

```javascript
// Look for these logs from firebase.js
Firebase configuration check:
API Key available: true
API Key value: AIzaSy...  (should show your key)
Auth Domain: eco-friendly-pledge.firebaseapp.com
Project ID: eco-friendly-pledge
```

If any value shows `undefined`, your environment variables are NOT loaded.

---

## 🚨 **MOST COMMON ISSUE**

### **Environment Variables Not Set in Vercel**

This is 90% of the time the issue. Your local `.env` file works fine, but Vercel deployment doesn't have access to it.

**Fix**: Go to Vercel → Settings → Environment Variables → Add all `VITE_*` variables → Redeploy

---

## 📝 **Quick Checklist**

- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Environment variables added to Vercel dashboard
- [ ] Vercel project redeployed after adding env variables
- [ ] User account exists in Firebase Authentication Users tab
- [ ] User account is not disabled
- [ ] Password is correct (try password reset if needed)
- [ ] Browser console shows Firebase config values (not undefined)

---

## 🔄 **After Making Changes**

1. **Redeploy on Vercel**: Deployments → Redeploy
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Try again**: Use Sign Up to create new account first

---

## 💡 **Temporary Testing Solution**

Use **"Continue with Google"** button instead:
- This bypasses email/password issues
- Requires Google sign-in method enabled in Firebase
- Works immediately without password concerns
