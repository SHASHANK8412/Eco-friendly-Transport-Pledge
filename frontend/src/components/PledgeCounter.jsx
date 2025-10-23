import { usePledgeCounter } from '../hooks/usePledgeCounter';

export default function PledgeCounter() {
  const { count, error } = usePledgeCounter();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-eco-secondary mb-2">Pledges Taken</h2>
      <div className="text-6xl font-bold text-eco-primary">
        {count !== undefined && count !== null ? Number(count).toLocaleString() : "0"}
      </div>
      <p className="mt-2 text-gray-600">
        People committed to making a difference
      </p>
      {error && (
        <p className="mt-1 text-xs text-gray-500">
          (Using cached data - real-time updates unavailable)
        </p>
      )}
    </div>
  );
}