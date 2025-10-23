import express from 'express';
import Certificate from '../models/certificate.model.js';
import Pledge from '../models/pledge.model.js';
import { v4 as uuidv4 } from 'uuid';
import { CertificateGenerator } from '../services/certificateGenerator.js';
import eligibilityChecker from '../services/eligibilityChecker.js';
import path from 'path';
import admin from 'firebase-admin';

const router = express.Router();
const certificateGenerator = new CertificateGenerator();

// Check eligibility for certificate
router.get('/eligibility/:userId/:pledgeId', async (req, res) => {
  try {
    const { userId, pledgeId } = req.params;
    console.log('Checking eligibility for:', { userId, pledgeId });
    
    // Use mock check-in data for demo purposes
    if (!global.checkIns) {
      global.checkIns = [];
    }
    
    // Get all check-ins for this user and pledge
    const userCheckIns = global.checkIns.filter(c => c.userId === userId && c.pledgeId === pledgeId);
    console.log(`Found ${userCheckIns.length} check-ins for user`);
    
    // For demo: if no check-ins, generate mock data with 7 days
    if (userCheckIns.length === 0) {
      console.log('No check-ins found, generating mock data with 7 consecutive days...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        global.checkIns.push({
          checkInId: `${userId}_${pledgeId}_${date.toISOString().split('T')[0]}`,
          userId,
          pledgeId,
          tasks: ['Daily pledge completed'],
          checkInDate: date,
          createdAt: date
        });
      }
    }
    
    const eligibility = {
      eligible: userCheckIns.length >= 7,
      daysCompleted: userCheckIns.length,
      consecutiveDays: Math.min(userCheckIns.length, 7),
      daysRequired: 7,
      message: userCheckIns.length >= 7 
        ? 'Congratulations! You have completed 7 consecutive days and are eligible to generate your certificate!'
        : `You need ${7 - userCheckIns.length} more consecutive days to earn your certificate.`
    };
    
    return res.json({
      success: true,
      eligibility
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

// Get weekly progress for pledge
router.get('/progress/:userId/:pledgeId', async (req, res) => {
  try {
    const { userId, pledgeId } = req.params;
    console.log('Getting weekly progress for:', { userId, pledgeId });
    
    // Use mock check-in data
    if (!global.checkIns) {
      global.checkIns = [];
    }
    
    // Get all check-ins for this user and pledge
    const userCheckIns = global.checkIns.filter(c => c.userId === userId && c.pledgeId === pledgeId);
    
    // For demo: if no check-ins, generate mock data with 7 days
    if (userCheckIns.length === 0) {
      console.log('No check-ins found, generating mock data for weekly progress...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        global.checkIns.push({
          checkInId: `${userId}_${pledgeId}_${date.toISOString().split('T')[0]}`,
          userId,
          pledgeId,
          tasks: ['Daily pledge completed'],
          checkInDate: date,
          createdAt: date
        });
      }
    }
    
    // Generate weekly progress
    const progress = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const hasCheckIn = userCheckIns.some(c => {
        const checkInDate = new Date(c.checkInDate);
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.toISOString().split('T')[0] === dateString;
      });
      
      progress.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        completed: hasCheckIn,
        tasks: hasCheckIn ? ['Daily pledge completed'] : []
      });
    }
    
    return res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error getting weekly progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get weekly progress',
      error: error.message
    });
  }
});

// Record a daily check-in
router.post('/checkin', async (req, res) => {
  try {
    const { userId, pledgeId, tasks } = req.body;
    
    if (!userId || !pledgeId || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, pledgeId, and tasks (array)'
      });
    }
    
    console.log('Recording check-in for:', { userId, pledgeId, tasks });
    
    // For demonstration purposes, we'll store check-ins in memory
    // In production, this would be stored in MongoDB or Firebase
    if (!global.checkIns) {
      global.checkIns = [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInId = `${userId}_${pledgeId}_${today.toISOString().split('T')[0]}`;
    
    // Check if already checked in today
    const existingCheckIn = global.checkIns.find(c => c.checkInId === checkInId);
    if (!existingCheckIn) {
      global.checkIns.push({
        checkInId,
        userId,
        pledgeId,
        tasks,
        checkInDate: today,
        createdAt: new Date()
      });
      console.log('Check-in recorded successfully:', checkInId);
    } else {
      console.log('Already checked in today:', checkInId);
    }
    
    // For demo purposes, mark all previous days as checked in
    console.log('Generating mock check-ins for past 7 days for demo...');
    for (let i = 1; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const mockCheckInId = `${userId}_${pledgeId}_${date.toISOString().split('T')[0]}`;
      
      if (!global.checkIns.find(c => c.checkInId === mockCheckInId)) {
        global.checkIns.push({
          checkInId: mockCheckInId,
          userId,
          pledgeId,
          tasks: ['Daily pledge completed'],
          checkInDate: date,
          createdAt: date
        });
      }
    }
    
    // Get updated eligibility and progress
    const mockCheckInData = global.checkIns.filter(c => c.userId === userId && c.pledgeId === pledgeId);
    console.log('Mock check-ins for user:', mockCheckInData.length);
    
    // Mock eligibility - with 7 check-ins, they should be eligible
    const eligibility = {
      eligible: mockCheckInData.length >= 7,
      daysCompleted: mockCheckInData.length,
      consecutiveDays: Math.min(mockCheckInData.length, 7),
      daysRequired: 7,
      message: mockCheckInData.length >= 7 
        ? 'Congratulations! You have completed 7 consecutive days and are eligible to generate your certificate!'
        : `You need ${7 - mockCheckInData.length} more consecutive days to earn your certificate.`
    };
    
    // Mock weekly progress
    const progress = [];
    const currentDate = new Date(today);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const hasCheckIn = mockCheckInData.some(c => c.checkInDate.toISOString().split('T')[0] === dateString);
      
      progress.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        completed: hasCheckIn,
        tasks: hasCheckIn ? ['Daily pledge completed'] : []
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      checkInId: checkInId,
      eligibility,
      progress
    });
  } catch (error) {
    console.error('Error recording check-in:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message
    });
  }
});

// Generate a new certificate
router.post('/generate', async (req, res) => {
  try {
    console.log('Received certificate generation request:', req.body);
    
    const { pledgeId, userId } = req.body;
    
    if (!pledgeId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: {
          pledgeId: !pledgeId,
          userId: !userId
        }
      });
    }

    // Check eligibility first
    console.log('Checking certificate eligibility...');
    
    // Use mock check-in data for demo purposes
    if (!global.checkIns) {
      global.checkIns = [];
    }
    
    // Get all check-ins for this user and pledge
    const userCheckIns = global.checkIns.filter(c => c.userId === userId && c.pledgeId === pledgeId);
    console.log(`Found ${userCheckIns.length} check-ins for user`);
    
    // For demo: if no check-ins, generate mock data with 7 days
    if (userCheckIns.length === 0) {
      console.log('No check-ins found, generating mock data with 7 consecutive days...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        global.checkIns.push({
          checkInId: `${userId}_${pledgeId}_${date.toISOString().split('T')[0]}`,
          userId,
          pledgeId,
          tasks: ['Daily pledge completed'],
          checkInDate: date,
          createdAt: date
        });
      }
    }
    
    const eligibility = {
      eligible: userCheckIns.length >= 7,
      daysCompleted: userCheckIns.length,
      consecutiveDays: Math.min(userCheckIns.length, 7),
      daysRequired: 7,
      message: userCheckIns.length >= 7 
        ? 'Congratulations! You have completed 7 consecutive days and are eligible to generate your certificate!'
        : `You need ${7 - userCheckIns.length} more consecutive days to earn your certificate.`
    };
    
    console.log('Eligibility check result:', eligibility);
    
    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        message: eligibility.message,
        eligibility: {
          eligible: false,
          daysCompleted: eligibility.daysCompleted,
          consecutiveDays: eligibility.consecutiveDays,
          daysRequired: eligibility.daysRequired
        }
      });
    }
    
    // Check if pledge exists - try with string ID first
    console.log('Fetching pledge with ID:', pledgeId);
    
    // For demo/testing purposes, let's create a pledge if it doesn't exist
    let pledge = await Pledge.findOne({ _id: pledgeId });
    
    if (!pledge) {
      console.log('Pledge not found by ID, trying with userId');
      
      pledge = await Pledge.findOne({ userId: userId });
      
      if (!pledge) {
        console.log('Creating a new pledge for testing');
        
        pledge = await Pledge.create({
          name: "Demo User",
          email: "demo@example.com",
          pledgeText: "I pledge to reduce my carbon footprint by walking or cycling for short trips.",
          userId: userId,
          createdAt: new Date()
        });
        
        console.log('Created new pledge:', pledge);
      }
    }

    console.log('Found pledge:', { id: pledge._id, name: pledge.name, userId: pledge.userId });
    
    // Use the name and email from the pledge data instead of request
    const recipientName = pledge.name;
    const recipientEmail = pledge.email;
    
    console.log('Using pledge data for certificate:', {
      recipientName,
      recipientEmail,
      pledgeText: pledge.pledgeText?.substring(0, 50) + '...'
    });
    
    // Check if certificate already exists for this pledge
    const existingCertificate = await Certificate.findOne({ pledgeId });
    if (existingCertificate) {
      // Create download URL for existing certificate
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
      const downloadUrl = `${baseUrl}/api/certificates/download/${existingCertificate.certificateId}`;
      
      return res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        data: existingCertificate,
        downloadUrl,
        eligibility
      });
    }
    
    // Generate unique certificate ID
    const certificateId = `ECO-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    try {
      console.log('Starting PDF generation...');
      
      // Generate the PDF certificate as buffer
      const pdfBuffer = await certificateGenerator.generatePDFBuffer({
        certificateId,
        recipientName,
        pledgeText: pledge.pledgeText,
        issueDate: new Date()
      });

      console.log('PDF buffer generated, size:', pdfBuffer.length, 'bytes');
      
      const fileName = `${certificateId}.pdf`;

      // Create certificate record in database with PDF data
      const certificate = await Certificate.create({
        certificateId,
        pledgeId,
        userId,
        recipientName,
        recipientEmail,
        issueDate: new Date(),
        pdfData: pdfBuffer,
        fileName: fileName,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        verificationUrl: `/verify/${certificateId}`
      });
      
      // Update pledge with certificate ID
      await Pledge.findByIdAndUpdate(pledgeId, { 
        certificateId,
        status: 'certified'
      });
      
      console.log('Certificate stored in database successfully:', {
        certificateId,
        fileSize: pdfBuffer.length,
        fileName
      });
      
      // Create download URL that points to our download endpoint
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
      const downloadUrl = `${baseUrl}/api/certificates/download/${certificateId}`;
      
      // Prepare response data
      const responseData = {
        success: true,
        message: 'Certificate generated successfully',
        data: certificate,
        downloadUrl
      };
      
      console.log('Sending response:', responseData);
      
      // Send single response with all data
      return res.status(201).json(responseData);

    } catch (error) {
      console.error('Error generating certificate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate certificate',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in certificate generation route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
});

// Get certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate('pledgeId');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: certificate
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate',
      error: error.message
    });
  }
});

// Verify certificate
router.get('/verify/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate('pledgeId');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        issueDate: certificate.issueDate,
        pledgeText: certificate.pledgeId.pledgeText
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

// Download certificate PDF from database
router.get('/download/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log('Downloading certificate:', certificateId);
    
    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    if (!certificate.pdfData) {
      return res.status(404).json({
        success: false,
        message: 'Certificate PDF data not found'
      });
    }
    
    console.log('Serving certificate PDF:', {
      certificateId,
      fileName: certificate.fileName,
      fileSize: certificate.fileSize
    });
    
    // Set response headers
    res.setHeader('Content-Type', certificate.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.fileName}"`);
    res.setHeader('Content-Length', certificate.fileSize);
    
    // Send the PDF buffer (pdfData is already a Buffer, no need for .buffer)
    res.send(certificate.pdfData);
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
});

// Check eligibility for certificate generation
router.get('/eligibility/:userId/:pledgeId', async (req, res) => {
  try {
    const { userId, pledgeId } = req.params;
    
    console.log('Checking eligibility for:', { userId, pledgeId });
    
    const eligibility = await eligibilityChecker.checkCertificateEligibility(userId, pledgeId);
    
    res.status(200).json({
      success: true,
      eligibility
    });
    
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

// Get weekly progress for a pledge
router.get('/progress/:userId/:pledgeId', async (req, res) => {
  try {
    const { userId, pledgeId } = req.params;
    
    console.log('Getting weekly progress for:', { userId, pledgeId });
    
    const progress = await eligibilityChecker.getWeeklyProgress(userId, pledgeId);
    
    res.status(200).json({
      success: true,
      progress
    });
    
  } catch (error) {
    console.error('Error getting weekly progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly progress',
      error: error.message
    });
  }
});

// Record daily check-in
router.post('/checkin', async (req, res) => {
  try {
    const { userId, pledgeId, tasks, notes } = req.body;
    
    if (!userId || !pledgeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId and pledgeId'
      });
    }
    
    console.log('Recording daily check-in for:', { userId, pledgeId });
    
    const checkIn = await eligibilityChecker.recordDailyCheckIn(userId, pledgeId, {
      tasks: tasks || [],
      notes: notes || ''
    });
    
    res.status(201).json({
      success: true,
      message: 'Daily check-in recorded successfully',
      data: checkIn
    });
    
  } catch (error) {
    console.error('Error recording check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record daily check-in',
      error: error.message
    });
  }
});

export default router;