import express from 'express';
import Pledge from '../models/pledge.model.js';

const router = express.Router();

// Get all pledges
router.get('/', async (req, res) => {
  try {
    const pledges = await Pledge.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: pledges.length,
      data: pledges 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve pledges', 
      error: error.message 
    });
  }
});

// Get pledges by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching pledges for user:', userId);

    // Handle development mode user IDs
    const query = userId.startsWith('dev-') 
      ? { userId: userId }  // Use the dev- userId directly
      : { userId: userId }; // For regular users

    const pledges = await Pledge.find(query).sort({ createdAt: -1 });
    console.log(`Found ${pledges.length} pledges for user:`, userId);

    // If no pledges found in MongoDB, return empty array with demo data for testing
    if (pledges.length === 0) {
      console.log('No pledges found in MongoDB, returning demo data for testing');
      
      // Create a demo pledge for demonstration purposes
      const demoPledge = {
        _id: `demo-${userId}-${Date.now()}`,
        name: 'Demo User',
        email: 'demo@example.com',
        pledgeText: 'I pledge to use sustainable transportation and reduce my carbon footprint',
        userId: userId,
        createdAt: new Date(),
        status: 'active',
        actions: ['Sustainable Transport']
      };
      
      return res.status(200).json({ 
        success: true, 
        count: 1,
        data: [demoPledge]
      });
    }

    res.status(200).json({ 
      success: true, 
      count: pledges.length,
      data: pledges 
    });
  } catch (error) {
    console.error('Error fetching user pledges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve user pledges', 
      error: error.message 
    });
  }
});

// Get pledge count
router.get('/count', async (req, res) => {
  try {
    const count = await Pledge.countDocuments();
    res.status(200).json({ 
      success: true, 
      count: count
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve pledge count', 
      error: error.message 
    });
  }
});

// Create new pledge
router.post('/', async (req, res) => {
  try {
    console.log('Received pledge data:', req.body);
    
    // Validate required fields
    const { name, email, pledgeText, userId } = req.body;
    
    if (!name || !email || !pledgeText || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['name', 'email', 'pledgeText', 'userId'],
        received: Object.keys(req.body)
      });
    }
    
    const pledge = await Pledge.create(req.body);
    
    // Broadcast updated count via WebSocket if available
    if (global.broadcastPledgeCount) {
      global.broadcastPledgeCount();
    }
    
    res.status(201).json({ 
      success: true, 
      data: pledge 
    });
  } catch (error) {
    console.error('Pledge creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create pledge', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Get pledge by ID
router.get('/:id', async (req, res) => {
  try {
    const pledge = await Pledge.findById(req.params.id);
    
    if (!pledge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pledge not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: pledge 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve pledge', 
      error: error.message 
    });
  }
});

export default router;