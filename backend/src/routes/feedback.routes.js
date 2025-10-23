import express from 'express';
import Feedback from '../models/feedback.model.js';

const router = express.Router();

// Get all feedback entries
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: feedback.length,
      data: feedback 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve feedback', 
      error: error.message 
    });
  }
});

// Submit new feedback
router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: feedback 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to submit feedback', 
      error: error.message 
    });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: feedback 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve feedback', 
      error: error.message 
    });
  }
});

// Update feedback status (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, 
      { status, adminResponse, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: feedback 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update feedback', 
      error: error.message 
    });
  }
});

export default router;