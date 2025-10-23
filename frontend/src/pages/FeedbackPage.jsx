import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';

export default function FeedbackPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleFeedbackSubmit = () => {
    // Invalidate and refetch feedback list
    queryClient.invalidateQueries(['feedback']);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Please sign in to leave feedback
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <FeedbackForm onSubmitSuccess={handleFeedbackSubmit} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Feedback</h2>
          <FeedbackList />
        </div>
      </div>
    </div>
  );
}