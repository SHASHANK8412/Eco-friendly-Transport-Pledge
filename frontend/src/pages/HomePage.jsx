import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PledgeCounter from '../components/PledgeCounter';
import { Leaf, Award, Users, TrendingUp, MessageSquare, Download, Brain, Target } from 'lucide-react';

export default function HomePage() {
  const [pledgeCount, setPledgeCount] = useState(1234);
  const [stats, setStats] = useState({
    totalUsers: 5678,
    co2Saved: 12345,
    treesPlanted: 890
  });
  const navigate = useNavigate();
  const { user, isDevelopmentMode } = useAuth();

  // Feature cards data
  const features = [
    {
      title: 'AI Pledge Assistant',
      description: 'Get personalized environmental recommendations powered by AI',
      icon: Brain,
      action: () => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/dashboard' } } });
        }
      },
      buttonText: user ? 'Try AI Assistant' : 'Sign Up for AI Help'
    },
    {
      title: 'Track Your Impact',
      description: 'Monitor your environmental contributions and see real results',
      icon: TrendingUp,
      action: () => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/dashboard' } } });
        }
      },
      buttonText: user ? 'View Dashboard' : 'Start Tracking'
    },
    {
      title: 'Get Certificates',
      description: 'Earn certificates for your environmental achievements',
      icon: Award,
      action: () => {
        if (user) {
          navigate('/certificate');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/certificate' } } });
        }
      },
      buttonText: user ? 'My Certificates' : 'Earn Certificates'
    },
    {
      title: 'Join Community',
      description: 'Connect with like-minded environmental advocates',
      icon: Users,
      action: () => {
        if (user) {
          navigate('/feedback');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/feedback' } } });
        }
      },
      buttonText: user ? 'Community' : 'Join Now'
    },
    {
      title: 'Share Feedback',
      description: 'Help us improve and share your environmental journey',
      icon: MessageSquare,
      action: () => {
        if (user) {
          navigate('/feedback');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/feedback' } } });
        }
      },
      buttonText: user ? 'Give Feedback' : 'Share Experience'
    },
    {
      title: 'Make Pledges',
      description: 'Commit to sustainable practices and track your progress',
      icon: Target,
      action: () => {
        if (user) {
          navigate('/pledge');
        } else {
          navigate('/login?signup=true', { state: { from: { pathname: '/pledge' } } });
        }
      },
      buttonText: user ? 'My Pledges' : 'Make First Pledge'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Take the Pledge for a</span>
            <span className="block text-green-600">Greener Tomorrow</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Join thousands of others in committing to sustainable practices and making a positive impact on our environment.
          </p>
          <div className="mt-5 max-w-lg mx-auto sm:flex sm:justify-center md:mt-8 gap-4">
            {!user ? (
              <>
                <div className="rounded-md shadow">
                  <Link
                    to="/login?signup=true"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 rounded-md shadow">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-md shadow">
                <button
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg"
                  onClick={() => navigate('/pledge')}
                >
                  Create New Pledge
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          <PledgeCounter count={pledgeCount} />
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact So Far</h2>
            <p className="mt-2 text-lg text-gray-600">Together, we're making a real difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <Leaf className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.co2Saved.toLocaleString()}</div>
              <div className="text-sm text-gray-600">kg CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.treesPlanted.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Trees Planted</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600">Powerful tools to help you make a lasting environmental impact</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <IconComponent className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <button
                    onClick={feature.action}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    {feature.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 bg-green-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-green-100 mb-8">Join our community and start your environmental journey today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/login?signup=true"
                  className="bg-white text-green-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/pledge')}
                  className="bg-white text-green-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Make a Pledge
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  View Dashboard
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (user) {
                navigate('/certificate');
              } else {
                navigate('/login?signup=true', { state: { from: { pathname: '/certificate' } } });
              }
            }}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Download className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Certificates</span>
          </button>
          <button
            onClick={() => {
              if (user) {
                navigate('/feedback');
              } else {
                navigate('/login?signup=true', { state: { from: { pathname: '/feedback' } } });
              }
            }}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Feedback</span>
          </button>
          <button
            onClick={() => {
              if (user) {
                navigate('/dashboard');
              } else {
                navigate('/login?signup=true', { state: { from: { pathname: '/dashboard' } } });
              }
            }}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Brain className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">AI Assistant</span>
          </button>
          <button
            onClick={() => {
              if (user) {
                navigate('/dashboard');
              } else {
                navigate('/login?signup=true', { state: { from: { pathname: '/dashboard' } } });
              }
            }}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Track Progress</span>
          </button>
        </div>
      </main>
    </div>
  );
}