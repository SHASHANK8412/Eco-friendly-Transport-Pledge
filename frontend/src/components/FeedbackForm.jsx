import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StarIcon } from '@heroicons/react/20/solid';

export default function FeedbackForm({ onSubmitSuccess }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get token - handle both Firebase and dev user cases
      let token = 'dev-token';
      try {
        if (user && typeof user.getIdToken === 'function') {
          token = await user.getIdToken();
        } else if (user && user.uid && user.uid.startsWith('dev-')) {
          // For dev users, create a mock token
          token = `dev-token-${user.uid}`;
        }
      } catch (tokenError) {
        console.error('Error getting token:', tokenError);
      }
      
      // Format data according to the feedback model schema
      const feedbackData = {
        userId: user.uid,
        name: user.displayName || 'Anonymous User',
        email: user.email,
        rating,
        comment,
        category: 'general',
      };

      console.log('Submitting feedback:', feedbackData);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Feedback submission error:', errorData);
        throw new Error(errorData?.message || 'Failed to submit feedback');
      }

      const data = await response.json();
      setRating(0);
      setComment('');
      onSubmitSuccess?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Feedback</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-primary hover:scale-110 transition-transform`}
              >
                <StarIcon
                  className={`h-8 w-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-eco-primary focus:ring-eco-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !rating}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-primary hover:bg-eco-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}