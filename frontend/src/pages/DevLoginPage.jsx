import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function DevLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, devLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Development User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  if (user) {
    const destination = location.state?.from?.pathname || '/';
    navigate(destination);
  }

  const handleDevLogin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await devLogin({ email, name });
      navigate('/pledge');
    } catch (error) {
      console.error('Dev login error:', error);
      setError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Development Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is for development purposes only
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleDevLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-eco-primary focus:border-eco-primary sm:text-sm"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-eco-primary focus:border-eco-primary sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-eco-secondary hover:bg-eco-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-primary ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'Log in (Development Mode)'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-eco-secondary hover:text-eco-primary">
            Back to Regular Login
          </Link>
        </div>
      </div>
    </div>
  );
}