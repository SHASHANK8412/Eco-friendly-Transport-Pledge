import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FirebaseService from '../services/firebaseService';

export default function UserOnboardingForm({ onComplete }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    age: '',
    location: '',
    interests: '',
    environmentalGoals: '',
    preferredTransport: '',
    currentHabits: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Save user profile data to Firebase
      await FirebaseService.updateUser(user.uid, {
        ...formData,
        isProfileComplete: true,
        completedAt: new Date().toISOString(),
        onboardingVersion: '1.0'
      });

      // Initialize user progress
      await FirebaseService.updateUserProgress({
        profileCompleted: true,
        signupDate: new Date().toISOString(),
        interests: formData.interests,
        goals: formData.environmentalGoals,
        preferredTransport: formData.preferredTransport,
        initialHabits: formData.currentHabits,
        totalPledges: 0,
        completedPledges: 0,
        co2Saved: 0,
        treesPlanted: 0
      });

      console.log('User onboarding data saved to Firebase');
      onComplete?.();
      
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to EcoPledge Portal!</h2>
          <p className="mt-2 text-gray-600">Let's personalize your environmental journey</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="13"
                max="120"
                required
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Your age"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (City, Country) *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., New York, USA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Environmental Interest *
              </label>
              <select
                id="interests"
                name="interests"
                required
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your main interest</option>
                <option value="renewable-energy">Renewable Energy</option>
                <option value="sustainable-transport">Sustainable Transportation</option>
                <option value="waste-reduction">Waste Reduction</option>
                <option value="water-conservation">Water Conservation</option>
                <option value="wildlife-protection">Wildlife Protection</option>
                <option value="climate-action">Climate Action</option>
                <option value="organic-farming">Organic Farming</option>
                <option value="green-building">Green Building</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferredTransport" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Transportation *
              </label>
              <select
                id="preferredTransport"
                name="preferredTransport"
                required
                value={formData.preferredTransport}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select transportation</option>
                <option value="walking">Walking</option>
                <option value="bicycle">Bicycle</option>
                <option value="public-transport">Public Transport</option>
                <option value="electric-vehicle">Electric Vehicle</option>
                <option value="hybrid-vehicle">Hybrid Vehicle</option>
                <option value="carpooling">Carpooling</option>
                <option value="traditional-car">Traditional Car</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="environmentalGoals" className="block text-sm font-medium text-gray-700 mb-2">
              Your Environmental Goals *
            </label>
            <textarea
              id="environmentalGoals"
              name="environmentalGoals"
              rows={3}
              required
              value={formData.environmentalGoals}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="What do you hope to achieve environmentally? (e.g., reduce carbon footprint, promote renewable energy, etc.)"
            />
          </div>

          <div>
            <label htmlFor="currentHabits" className="block text-sm font-medium text-gray-700 mb-2">
              Current Environmental Habits (Optional)
            </label>
            <textarea
              id="currentHabits"
              name="currentHabits"
              rows={3}
              value={formData.currentHabits}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Tell us about any environmental practices you currently follow..."
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving Your Profile...' : 'Complete Setup & Continue'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your information helps us provide personalized environmental recommendations and track your impact.
          </p>
        </div>
      </div>
    </div>
  );
}