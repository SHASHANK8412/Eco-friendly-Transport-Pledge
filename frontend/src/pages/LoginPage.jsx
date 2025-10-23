import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
    organization: ''
  });
  
  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      // Reset signing in state when user is available
      setIsSigningIn(false);
      // Navigate to dashboard or redirected path
      navigate(location.state?.from?.pathname || '/dashboard');
    }
  }, [user, navigate, location]);
  
  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError('');

    try {
      if (isSignUp) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsSigningIn(false);
          return;
        }

        // Validate required fields
        if (!formData.displayName?.trim()) {
          setError('Please enter your name');
          setIsSigningIn(false);
          return;
        }

        await signUpWithEmail(formData.email, formData.password, formData.displayName);
        // The user state will be updated by the onAuthStateChanged listener
        // which will trigger the useEffect to redirect
      } else {
        await signInWithEmail(formData.email, formData.password);
        // The user state will be updated by the onAuthStateChanged listener
        // which will trigger the useEffect to redirect
      }
      
      // We don't reset isSigningIn here because we want the button to show 
      // "Signing in..." until the redirect happens in the useEffect
      
    } catch (err) {
      setError(err.message);
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setError('');

    try {
      await signInWithGoogle();
      // The user state will be updated by the onAuthStateChanged listener
      // which will trigger the useEffect to redirect
      
      // We don't reset isSigningIn here because we want the button to show 
      // "Signing in..." until the redirect happens in the useEffect
    } catch (err) {
      setError(err.message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp 
              ? 'Join EcoPledge and start making a difference today'
              : 'Sign in to continue your environmental journey'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  autoComplete="name"
                  required={isSignUp}
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required={isSignUp}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    autoComplete="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSigningIn 
                  ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                {isSigningIn ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-medium text-green-600 hover:text-green-500 focus:outline-none focus:underline transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}