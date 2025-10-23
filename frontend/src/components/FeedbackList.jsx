import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { StarIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';

const PAGE_SIZE = 10;

export default function FeedbackList() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // Will be updated via Firebase claims

  // Fetch admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = await user?.getIdTokenResult();
      setIsAdmin(token?.claims?.admin === true);
    };
    checkAdminStatus();
  }, [user]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      // Get token for auth (similar pattern as other components)
      let token = 'dev-token';
      try {
        if (user && typeof user.getIdToken === 'function') {
          token = await user.getIdToken();
        } else if (user && user.uid && user.uid.startsWith('dev-')) {
          token = `dev-token-${user.uid}`;
        }
      } catch (tokenError) {
        console.error('Error getting token:', tokenError);
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feedback`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Feedback fetch error:', errorData);
        throw new Error(errorData?.message || 'Failed to fetch feedback');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feedback/${feedbackId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      // Invalidate and refetch
      queryClient.invalidateQueries(['feedback']);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete feedback');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-600 py-4">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {data?.data?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No feedback yet</div>
      ) : (
        data?.data?.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow p-4 relative"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {item.name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon
                      key={index}
                      className={`h-5 w-5 ${
                        index < item.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-600">{item.comment}</p>
          </div>
        ))
      )}
      
      <div className="text-center py-4">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-eco-primary hover:bg-eco-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-primary disabled:opacity-50"
        >
          Refresh Feedback
        </button>
      </div>
    </div>
  );
}