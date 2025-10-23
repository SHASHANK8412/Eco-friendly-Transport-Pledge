import { useNavigate } from 'react-router-dom';
import PledgeForm from '../components/PledgeForm';
import PledgeCounter from '../components/PledgeCounter';

export default function PledgePage() {
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    // Show success message and redirect
    alert('Thank you for taking the pledge!');
    // Force reload to ensure pledge count is updated
    window.location.href = '/'; // Using window.location instead of navigate to force full page reload
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <PledgeForm onSubmitSuccess={handleSubmitSuccess} />
        <div className="md:sticky md:top-24">
          <PledgeCounter />
        </div>
      </div>
    </div>
  );
}