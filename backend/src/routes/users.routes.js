import express from 'express';
import User from '../models/user.model.js';

const router = express.Router();

// Create or update user profile
router.post('/', async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid },
        { ...req.body, lastLogin: new Date() },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        message: 'User profile updated',
        data: updatedUser
      });
    }
    
    // Create new user
    const newUser = await User.create({
      ...req.body,
      lastLogin: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'User profile created',
      data: newUser
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create/update user profile',
      error: error.message
    });
  }
});

// Get user profile by Firebase UID
router.get('/:firebaseUid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
});

// Update user profile
router.patch('/:firebaseUid', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User profile updated',
      data: updatedUser
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
});

export default router;