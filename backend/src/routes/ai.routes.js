import express from 'express';
import { AIService } from '../services/aiService.js';
import Pledge from '../models/pledge.model.js';

const router = express.Router();
const aiService = new AIService();

// Route for AI pledge suggestions
router.post('/pledgeAssistant', async (req, res) => {
  try {
    const { userRoutine, userId } = req.body;

    if (!userRoutine) {
      return res.status(400).json({
        success: false,
        message: 'userRoutine is required'
      });
    }

    console.log('AI Pledge Assistant request:', { userRoutine, userId });

    // Generate AI suggestion
    const suggestion = await aiService.generatePledgeSuggestion(userRoutine);

    // Log the interaction for analytics (optional)
    if (userId) {
      console.log(`AI suggestion generated for user ${userId}: ${suggestion.suggestion}`);
    }

    res.status(200).json({
      success: true,
      data: {
        suggestion: suggestion.suggestion,
        co2Reduction: suggestion.co2Reduction,
        encouragement: suggestion.encouragement,
        actionSteps: suggestion.actionSteps,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in AI pledge assistant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate pledge suggestion',
      error: error.message
    });
  }
});

// Route for AI eco insights
router.post('/ecoInsights', async (req, res) => {
  try {
    const { userId, timeframe = 'month' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    console.log('AI Eco Insights request for user:', userId);

    // Calculate timeframe for data retrieval
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Fetch user's pledge data
    const userPledges = await Pledge.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // Calculate user stats
    const userStats = {
      pledgesMade: userPledges.length,
      totalDistance: userPledges.reduce((total, pledge) => {
        // Extract distance from pledge text (basic parsing)
        const distanceMatch = pledge.pledgeText.match(/(\d+)\s*km/i);
        return total + (distanceMatch ? parseInt(distanceMatch[1]) : 5); // default 5km if not found
      }, 0),
      carbonSaved: userPledges.length * 2.3, // Rough estimate: 2.3kg CO2 per pledge
      transportModes: [...new Set(userPledges.map(pledge => {
        const text = pledge.pledgeText.toLowerCase();
        if (text.includes('bicycle') || text.includes('bike')) return 'Bicycle';
        if (text.includes('public transport') || text.includes('bus') || text.includes('train')) return 'Public Transport';
        if (text.includes('walk')) return 'Walking';
        if (text.includes('carpool')) return 'Carpooling';
        if (text.includes('electric')) return 'Electric Vehicle';
        return 'Sustainable Transport';
      }))]
    };

    console.log('User stats calculated:', userStats);

    // Generate AI insights
    const insights = await aiService.generateEcoInsights(userStats);

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        stats: userStats,
        insights: {
          summary: insights.summary,
          comparison: insights.comparison,
          improvements: insights.improvements,
          milestone: insights.milestone
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in AI eco insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate eco insights',
      error: error.message
    });
  }
});

// Route for quick AI tips
router.get('/quickTips', async (req, res) => {
  try {
    const tips = [
      {
        title: "Start Small",
        tip: "Begin with one sustainable transport choice per week - consistency beats perfection!",
        impact: "Even one day per week can save 2-3 kg CO₂ monthly"
      },
      {
        title: "Track Your Progress",
        tip: "Keep a log of your sustainable choices to see your environmental impact grow",
        impact: "Tracking increases commitment by 40%"
      },
      {
        title: "Find Transport Buddies",
        tip: "Carpooling or cycling with friends makes sustainability more enjoyable",
        impact: "Shared transport can reduce individual carbon footprint by 50%"
      },
      {
        title: "Plan Your Routes",
        tip: "Combine errands into one trip or choose routes with public transport options",
        impact: "Efficient planning can reduce transport emissions by 30%"
      },
      {
        title: "Celebrate Milestones",
        tip: "Reward yourself for reaching sustainability goals to maintain motivation",
        impact: "Recognition boosts long-term commitment to eco-friendly habits"
      }
    ];

    // Return a random tip or cycle through them
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    res.status(200).json({
      success: true,
      data: {
        tip: randomTip,
        allTips: tips,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching quick tips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tips',
      error: error.message
    });
  }
});

export default router;