import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Award, TrendingUp, Brain, RefreshCw, Target, Calendar, TreePine } from 'lucide-react';
import AIQuickTips from '../components/AIQuickTips';
import FirebaseService from '../services/firebaseService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPledges: 0,
    totalDistanceSaved: 0,
    totalCO2Reduced: 0,
    thisMonthPledges: 0
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      console.log('Fetching user stats for:', user?.uid);
      
      // Fetch pledges from backend API instead of Firebase
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/pledges/user/${user?.uid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pledges: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pledges fetched from backend:', data);
      
      // Extract pledges array from response
      let pledges = [];
      if (data.success && data.data) {
        pledges = Array.isArray(data.data) ? data.data : [data.data];
      }
      
      console.log('Processed pledges:', pledges);

      // Calculate statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthPledges = pledges.filter(pledge => {
        let pledgeDate;
        
        // Handle different date formats
        if (pledge.createdAt?.toDate) {
          pledgeDate = new Date(pledge.createdAt.toDate());
        } else if (typeof pledge.createdAt === 'string') {
          pledgeDate = new Date(pledge.createdAt);
        } else if (pledge.createdAt instanceof Date) {
          pledgeDate = pledge.createdAt;
        } else {
          pledgeDate = new Date();
        }
        
        return pledgeDate.getMonth() === currentMonth && pledgeDate.getFullYear() === currentYear;
      });

      // Estimate distance and CO2 based on pledge content
      const calculateImpact = (pledges) => {
        let totalDistance = 0;
        let totalCO2 = 0;

        pledges.forEach(pledge => {
          const text = pledge.pledgeText?.toLowerCase() || '';
          
          // Extract distance from pledge text (basic parsing)
          const distanceMatch = text.match(/(\d+)\s*km/i);
          const distance = distanceMatch ? parseInt(distanceMatch[1]) : 5; // default 5km
          
          // Estimate monthly impact based on transport mode
          let monthlyDistance = distance * 20; // Assume 20 days per month
          let co2SavedPerKm = 0.12; // kg CO2 per km (average for car vs sustainable transport)
          
          if (text.includes('bicycle') || text.includes('bike')) {
            co2SavedPerKm = 0.15; // Higher savings for cycling
          } else if (text.includes('public transport') || text.includes('bus')) {
            co2SavedPerKm = 0.08; // Moderate savings for public transport
          } else if (text.includes('walk')) {
            co2SavedPerKm = 0.15; // High savings for walking
          }
          
          totalDistance += monthlyDistance;
          totalCO2 += monthlyDistance * co2SavedPerKm;
        });

        return { totalDistance, totalCO2 };
      };

      const totalImpact = calculateImpact(pledges);
      const monthlyImpact = calculateImpact(thisMonthPledges);

      setStats({
        totalPledges: pledges.length,
        totalDistanceSaved: Math.round(totalImpact.totalDistance),
        totalCO2Reduced: Math.round(totalImpact.totalCO2 * 10) / 10, // Round to 1 decimal
        thisMonthPledges: thisMonthPledges.length,
        monthlyDistance: Math.round(monthlyImpact.totalDistance),
        monthlyCO2: Math.round(monthlyImpact.totalCO2 * 10) / 10
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!user?.uid) return;
    
    setIsLoadingInsights(true);
    setInsightError(null);

    try {
      console.log('Generating AI insights with stats:', stats);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/ai/ecoInsights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          timeframe: 'month',
          stats: stats  // Pass current stats to AI
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI insights response:', data);

      if (data.success) {
        setAiInsights(data.data.insights);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback insights with actual stats
      setAiInsights({
        summary: `Great progress! You've made ${stats.totalPledges} eco-pledge${stats.totalPledges !== 1 ? 's' : ''} and saved approximately ${stats.totalCO2Reduced} kg of CO₂ this month!`,
        comparison: `You're contributing more to sustainability than the average person - great work!`,
        improvements: [
          "Try expanding to other areas like energy or water conservation",
          "Encourage friends and family to join your eco-friendly journey",
          `Set a goal to increase your pledges to ${stats.totalPledges + 3} this month`
        ],
        milestone: stats.totalPledges >= 5 ? "🏆 Amazing! You've reached 5+ pledges!" : "🌱 Keep up the excellent work! Every small step counts!"
      });,
        milestone: "🌱 Keep up the excellent work! Every small step counts!"
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    if (stats.totalPledges > 0 && !aiInsights) {
      generateAIInsights();
    }
  }, [stats]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "green" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || user?.email}! 🌿
          </h1>
          <p className="text-gray-600 mt-2">
            Track your environmental impact and get personalized sustainability insights.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Total Pledges"
            value={stats.totalPledges}
            subtitle="Lifetime commitments"
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Distance Saved"
            value={`${stats.totalDistanceSaved} km`}
            subtitle="Sustainable transport"
            color="green"
          />
          <StatCard
            icon={TreePine}
            title="CO₂ Reduced"
            value={`${stats.totalCO2Reduced} kg`}
            subtitle="Carbon footprint saved"
            color="emerald"
          />
          <StatCard
            icon={Calendar}
            title="This Month"
            value={stats.thisMonthPledges}
            subtitle="New pledges made"
            color="purple"
          />
        </div>

        {/* AI-Generated Eco Insights */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI-Generated Eco Insights</h2>
                <p className="text-sm text-gray-600">Personalized sustainability analysis</p>
              </div>
            </div>
            <button
              onClick={generateAIInsights}
              disabled={isLoadingInsights}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
              <span>{isLoadingInsights ? 'Generating...' : 'Regenerate Insight'}</span>
            </button>
          </div>

          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-green-200 rounded w-64"></div>
                  <div className="h-4 bg-green-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          ) : aiInsights ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">📊 Your Impact Summary</h3>
                <p className="text-green-700 leading-relaxed">{aiInsights.summary}</p>
              </div>

              {/* Comparison */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🏆 How You Compare</h3>
                <p className="text-blue-700 leading-relaxed">{aiInsights.comparison}</p>
              </div>

              {/* Improvements */}
              {aiInsights.improvements && aiInsights.improvements.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">💡 Suggestions for Growth</h3>
                  <ul className="space-y-2">
                    {aiInsights.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start text-purple-700">
                        <span className="text-purple-500 mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Milestone */}
              {aiInsights.milestone && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">🎉 Celebration</h3>
                  <p className="text-yellow-700 leading-relaxed">{aiInsights.milestone}</p>
                </div>
              )}

              {lastUpdated && (
                <p className="text-xs text-gray-500 text-center">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Make some eco-pledges to see your personalized insights!</p>
            </div>
          )}

          {insightError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">
                <strong>Note:</strong> AI insights are currently using fallback mode. 
                Your sustainability data is still being tracked accurately!
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <AIQuickTips />
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Leaf className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Make a New Pledge</h3>
              <p className="text-sm text-gray-600 mb-4">
                Commit to a new sustainable transportation habit
              </p>
              <button 
                onClick={() => window.location.href = '/pledge'}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create Pledge
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Award className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Get Certificate</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download certificates for your eco-achievements
              </p>
              <button 
                onClick={() => window.location.href = '/certificate'}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Certificates
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Share Feedback</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us improve the EcoPledge platform
              </p>
              <button 
                onClick={() => window.location.href = '/feedback'}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;