import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get display name from user profile or auth user
  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userPhoto = userProfile?.photoURL || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm w-full">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-green-600">EcoPledge Portal</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link
              to="/"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/feedback"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Feedback
            </Link>
            <Link
              to="/certificate"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Certificate
            </Link>
          </div>

          {/* Desktop Authentication */}
          <div className="hidden sm:flex sm:items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <img
                    className="h-8 w-8 rounded-full border-2 border-green-200"
                    src={userPhoto}
                    alt={displayName}
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {displayName}
                  </span>
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </div>
                    </Link>
                    <Link
                      to="/pledge"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        My Pledges
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center">
                        {isLoggingOut ? (
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        )}
                        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?signup=true"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/feedback"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Feedback
              </Link>
              <Link
                to="/certificate"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Certificate
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center px-4">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=10B981&color=fff`}
                      alt={user.displayName || "User"}
                    />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.displayName || "User"}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/pledge"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Pledges
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?signup=true"
                    className="block mx-4 py-2 px-4 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-md text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}