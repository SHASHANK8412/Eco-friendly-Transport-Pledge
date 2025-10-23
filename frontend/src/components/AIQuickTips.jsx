import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Leaf } from 'lucide-react';

const AIQuickTips = () => {
  const [tip, setTip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/quickTips');
      if (response.ok) {
        const data = await response.json();
        setTip(data.data.tip);
      }
    } catch (error) {
      console.error('Error fetching tip:', error);
      // Fallback tip
      setTip({
        title: "Start Small",
        tip: "Begin with one sustainable transport choice per week - consistency beats perfection!",
        impact: "Even one day per week can save 2-3 kg CO₂ monthly"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-green-800">💡 AI Sustainability Tip</h3>
        </div>
        <button
          onClick={fetchTip}
          disabled={isLoading}
          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {tip && (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-green-900">{tip.title}</h4>
            <p className="text-green-700 text-sm leading-relaxed">{tip.tip}</p>
          </div>
          <div className="bg-green-100 rounded-md p-3">
            <p className="text-xs font-medium text-green-800">
              <Leaf className="w-3 h-3 inline mr-1" />
              Impact: {tip.impact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuickTips;