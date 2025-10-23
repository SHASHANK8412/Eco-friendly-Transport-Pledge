import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';
import FirebaseService from '../services/firebaseService';

const AuthContext = createContext(undefined);

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/operation-not-allowed': 'This authentication method is not enabled',
    'auth/weak-password': 'Please use a stronger password (at least 6 characters)',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/popup-closed-by-user': 'Sign in was cancelled',
    'auth/popup-blocked': 'Sign in popup was blocked by your browser',
    'auth/network-request-failed': 'Network error occurred. Please check your connection',
    'default': 'An error occurred during authentication'
  };
  return errorMessages[errorCode] || errorMessages.default;
};

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.MODE === 'development';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check for a dev user in localStorage
    const devUser = localStorage.getItem('devUser');
    
    if (isDevelopmentMode && devUser) {
      setUser(JSON.parse(devUser));
      setLoading(false);
      return;
    }

    // Otherwise use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set user state immediately to trigger redirects
        setUser(user);
        
        try {
          // Get or create user profile in Firestore
          let profile = await FirebaseService.getUser(user.uid);
          
          if (!profile) {
            // Create new user profile
            profile = await FirebaseService.createUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`,
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });
          } else {
            // Update last login
            await FirebaseService.updateUser(user.uid, {
              lastLogin: new Date().toISOString()
            });
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Error managing user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // This is the more comprehensive implementation with display name support
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await FirebaseService.updateUser(user.uid, {
        displayName: displayName || email.split('@')[0],
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&background=0D8ABC&color=fff`
      });
      
      return user;
    } catch (error) {
      console.error('Signup Error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  // Enhanced signInWithEmail with error handling
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login Error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful");
      return result.user;
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const logout = async () => {
    // Check if user is a dev user
    if (isDevelopmentMode && localStorage.getItem('devUser')) {
      localStorage.removeItem('devUser');
      setUser(null);
      return Promise.resolve();
    }
    
    // Otherwise use Firebase signOut
    return signOut(auth);
  };

  const devLogin = ({ email, name }) => {
    if (!isDevelopmentMode) {
      console.error('Development login can only be used in development mode');
      return Promise.reject(new Error('Development login can only be used in development mode'));
    }
    
    const mockUser = {
      uid: `dev-${Date.now()}`,
      email: email || 'dev@example.com',
      displayName: name || 'Development User',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Dev User')}&background=0D8ABC&color=fff`,
      getIdToken: () => Promise.resolve(`dev-token-${Date.now()}`)
    };
    
    localStorage.setItem('devUser', JSON.stringify(mockUser));
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const value = {
    user,
    userProfile,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logout,
    isDevelopmentMode,
    devLogin,
    // Firebase service methods for easy access
    createPledge: FirebaseService.createPledge,
    getUserPledges: FirebaseService.getUserPledges,
    updatePledge: FirebaseService.updatePledge,
    deletePledge: FirebaseService.deletePledge,
    createCertificate: FirebaseService.createCertificate,
    getUserCertificates: FirebaseService.getUserCertificates,
    saveAIInteraction: FirebaseService.saveAIInteraction,
    getUserAIHistory: FirebaseService.getUserAIHistory,
    updateUserProgress: FirebaseService.updateUserProgress,
    getUserProgress: FirebaseService.getUserProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}