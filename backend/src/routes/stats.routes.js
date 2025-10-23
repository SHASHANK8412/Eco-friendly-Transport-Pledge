import express from 'express';
import Stats from '../models/stats.model.js';
import Pledge from '../models/pledge.model.js';
import Certificate from '../models/certificate.model.js';
import User from '../models/user.model.js';
import Feedback from '../models/feedback.model.js';

const router = express.Router();

// Get current stats
router.get('/', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      // Calculate initial stats
      await updateStats();
      stats = await Stats.findOne();
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats',
      error: error.message
    });
  }
});

// Update stats (can be called manually or by a scheduled job)
router.post('/update', async (req, res) => {
  try {
    await updateStats();
    const stats = await Stats.findOne();
    
    res.status(200).json({
      success: true,
      message: 'Stats updated successfully',
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stats',
      error: error.message
    });
  }
});

// Helper function to update stats
async function updateStats() {
  // Count pledges
  const totalPledges = await Pledge.countDocuments();
  
  // Count certificates
  const totalCertificates = await Certificate.countDocuments();
  
  // Count users
  const totalUsers = await User.countDocuments();
  
  // Calculate average rating
  const feedbackResult = await Feedback.aggregate([
    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
  ]);
  const averageRating = feedbackResult.length > 0 ? feedbackResult[0].averageRating : 0;
  
  // Count pledges by country
  const countriesResult = await Pledge.aggregate([
    { $group: { _id: '$location.country', count: { $sum: 1 } } }
  ]);
  const pledgesByCountry = {};
  countriesResult.forEach(item => {
    if (item._id) {
      pledgesByCountry[item._id] = item.count;
    }
  });
  
  // Count pledges by date
  const datesResult = await Pledge.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    }
  ]);
  const pledgesByDate = {};
  datesResult.forEach(item => {
    if (item._id) {
      pledgesByDate[item._id] = item.count;
    }
  });
  
  // Update or create stats document
  await Stats.createOrUpdate({
    totalPledges,
    totalCertificates,
    totalUsers,
    averageRating,
    pledgesByCountry,
    pledgesByDate,
    lastUpdated: new Date()
  });
}

export default router;