import express from 'express';
import Test from '../models/test.model.js';

const router = express.Router();

// Test database connection
router.post('/test-connection', async (req, res) => {
  try {
    const test = new Test({
      message: 'Database connection test successful'
    });
    await test.save();
    res.status(200).json({ 
      success: true, 
      message: 'Database connection and write operation successful',
      data: test 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database operation failed', 
      error: error.message 
    });
  }
});

// Get all test documents
router.get('/test-connection', async (req, res) => {
  try {
    const tests = await Test.find().sort({ timestamp: -1 }).limit(5);
    res.status(200).json({ 
      success: true, 
      message: 'Successfully retrieved test documents',
      data: tests 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve test documents', 
      error: error.message 
    });
  }
});

export default router;