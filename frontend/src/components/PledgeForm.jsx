import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FirebaseService from '../services/firebaseService';
import { Sparkles, Lightbulb, TrendingUp } from 'lucide-react';

const transportOptions = [
  'Public Transport',
  'Bicycle',
  'Walking',
  'Carpooling',
  'Electric Vehicle',
];

export default function PledgeForm({ onSubmitSuccess }) {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    modeOfTransport: '',
    pledgeDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [userRoutine, setUserRoutine] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Return auth required message if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to take the eco pledge and make a difference.</p>
        <div className="flex gap-4">
          <a 
            href="/login" 
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Login
          </a>
          <a 
            href="/login?signup=true" 
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign Up
          </a>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // AI Pledge Assistant function
  const getAiSuggestion = async () => {
    if (!userRoutine.trim()) {
      setError('Please describe your daily routine to get AI suggestions');
      return;
    }

    setLoadingAi(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/ai/pledgeAssistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRoutine,
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const data = await response.json();
      console.log('AI suggestion response:', data);

      if (data.success) {
        setAiSuggestion(data.data);
      } else {
        throw new Error(data.message || 'Failed to generate suggestion');
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setError('Failed to get AI suggestion. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    
    // Try to extract transport mode from suggestion
    const suggestion = aiSuggestion.suggestion.toLowerCase();
    let transport = '';
    
    if (suggestion.includes('bicycle') || suggestion.includes('bike') || suggestion.includes('cycling')) {
      transport = 'Bicycle';
    } else if (suggestion.includes('walk')) {
      transport = 'Walking';
    } else if (suggestion.includes('carpool')) {
      transport = 'Carpooling';
    } else if (suggestion.includes('public transport') || suggestion.includes('bus') || suggestion.includes('train')) {
      transport = 'Public Transport';
    } else if (suggestion.includes('electric')) {
      transport = 'Electric Vehicle';
    }
    
    if (transport) {
      setFormData(prev => ({
        ...prev,
        modeOfTransport: transport
      }));
    }
    
    setShowAiAssistant(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to submit a pledge');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Format data according to the Firebase Pledge schema
      const pledgeData = {
        name: formData.name || user.displayName || 'Anonymous User',
        email: user.email || 'dev@example.com',
        pledgeText: `I pledge to use ${formData.modeOfTransport} for my daily commute to reduce carbon emissions. ${formData.rollNo ? `(Roll Number: ${formData.rollNo})` : ''}`,
        actions: [formData.modeOfTransport],
        rollNo: formData.rollNo,
        modeOfTransport: formData.modeOfTransport,
        pledgeDate: formData.pledgeDate,
        userId: user.uid,
        location: {
          city: 'Unknown',
          country: 'Unknown'
        }
      };
      
      console.log('Current user:', user);
      console.log('Submitting pledge data to Firebase:', pledgeData);

      // Save to Firebase
      const result = await FirebaseService.createPledge(pledgeData, user);
      console.log('Pledge saved to Firebase:', result);
      
      // Also save to backend API to ensure pledge count is updated
      try {
        const apiResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pledges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pledgeData),
        });
        const apiResult = await apiResponse.json();
        console.log('Pledge saved to backend API:', apiResult);
      } catch (apiError) {
        console.error('Failed to save pledge to backend API:', apiError);
      }
      
      onSubmitSuccess?.(result);
      setFormData({
        name: '',
        rollNo: '',
        modeOfTransport: '',
        pledgeDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Firebase pledge submission error:', err);
      if (err.message?.toLowerCase().includes('not authenticated') || err.code === 'auth/not-authenticated') {
        setError('Your session has expired. Please log in again to submit your pledge.');
      } else {
        setError(err.message || 'Failed to submit pledge. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Take the Eco Pledge</h2>
      
      {/* AI Assistant Toggle Button */}
      <button
        type="button"
        onClick={() => setShowAiAssistant(!showAiAssistant)}
        className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">
          {showAiAssistant ? 'Hide AI Assistant' : 'Get AI-Powered Suggestions ✨'}
        </span>
      </button>

      {/* AI Assistant Panel */}
      {showAiAssistant && (
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-start gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">AI Pledge Assistant</h3>
              <p className="text-sm text-gray-600">Describe your daily routine and get personalized eco-friendly suggestions!</p>
            </div>
          </div>

          <textarea
            value={userRoutine}
            onChange={(e) => setUserRoutine(e.target.value)}
            placeholder="e.g., I drive 10km to work every day, sometimes take the bus..."
            className="w-full p-3 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3 min-h-[100px]"
          />

          <button
            type="button"
            onClick={getAiSuggestion}
            disabled={loadingAi || !userRoutine.trim()}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingAi ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generating Suggestions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get AI Suggestion</span>
              </>
            )}
          </button>

          {/* AI Suggestion Display */}
          {aiSuggestion && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">AI Recommendation</h4>
                  <p className="text-sm text-gray-700 mt-1">{aiSuggestion.suggestion}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">💚 CO₂ Savings:</span>
                  <span className="text-green-600 font-semibold">{aiSuggestion.co2Reduction} kg/month</span>
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Action Steps:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiSuggestion.actionSteps?.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700 italic">
                  {aiSuggestion.encouragement}
                </div>
              </div>

              <button
                type="button"
                onClick={applyAiSuggestion}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Apply This Suggestion to Form
              </button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-primary focus:ring-eco-primary"
          />
        </div>

        <div>
          <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
            Roll Number
          </label>
          <input
            type="text"
            id="rollNo"
            name="rollNo"
            required
            value={formData.rollNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-primary focus:ring-eco-primary"
          />
        </div>

        <div>
          <label htmlFor="modeOfTransport" className="block text-sm font-medium text-gray-700">
            Mode of Transport
          </label>
          <select
            id="modeOfTransport"
            name="modeOfTransport"
            required
            value={formData.modeOfTransport}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-primary focus:ring-eco-primary"
          >
            <option value="">Select a mode of transport</option>
            {transportOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pledgeDate" className="block text-sm font-medium text-gray-700">
            Pledge Date
          </label>
          <input
            type="date"
            id="pledgeDate"
            name="pledgeDate"
            required
            value={formData.pledgeDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-primary focus:ring-eco-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-primary hover:bg-eco-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-primary disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Pledge'}
        </button>
      </form>
    </div>
  );
}