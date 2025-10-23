import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import FirebaseService from '../services/firebaseService';
import { CheckCircle, Calendar, Trophy, Flame } from 'lucide-react';

export default function DailyCheckInPage() {
  const { user } = useAuth();
  const [selectedPledge, setSelectedPledge] = useState(null);
  const [tasks, setTasks] = useState(['']);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch user's pledges
  const { data: pledges, isLoading } = useQuery({
    queryKey: ['userPledges', user?.uid],
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      const response = await fetch(`${API_URL}/api/pledges/user/${user.uid}`);
      if (!response.ok) throw new Error('Failed to fetch pledges');
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!user?.uid,
  });

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleRemoveTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks.length > 0 ? newTasks : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPledge) {
      setError('Please select a pledge');
      return;
    }

    const completedTasks = tasks.filter(t => t.trim() !== '');
    if (completedTasks.length === 0) {
      setError('Please add at least one task');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      await FirebaseService.recordDailyCheckIn(selectedPledge, {
        tasks: completedTasks,
        notes: notes.trim()
      });

      setSuccess(true);
      setTasks(['']);
      setNotes('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error recording check-in:', error);
      setError(error.message || 'Failed to record check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Flame className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Check-In</h1>
          <p className="text-gray-600">
            Track your progress and build a 7-day streak to earn your certificate
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-green-800">Check-in recorded!</p>
                <p className="text-sm text-green-600">Keep up the great work!</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {(!pledges || pledges.length === 0) ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">No Pledges Yet</h2>
            <p className="text-gray-600 mb-4">Create a pledge first to start your daily check-ins.</p>
            <a
              href="/pledge"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Pledge
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Pledge Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Pledge
              </label>
              <select
                value={selectedPledge || ''}
                onChange={(e) => setSelectedPledge(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Choose a pledge...</option>
                {pledges.map((pledge) => (
                  <option key={pledge._id} value={pledge._id}>
                    {pledge.name}'s Pledge - {new Date(pledge.pledgeDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Tasks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Today's Tasks Completed
              </label>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      placeholder="e.g., Used reusable water bottle"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Add Another Task
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any reflections or observations about today?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Recording...
                </div>
              ) : (
                'Record Check-In'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Trophy className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Earn Your Certificate</h3>
              <p className="text-sm text-blue-600">
                Complete your daily check-in for 7 consecutive days to unlock your eco-certificate!
                Each check-in counts toward your streak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
