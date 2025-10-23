import Pledge from '../models/Pledge.js';
import { broadcastPledgeCount } from '../index.js';

export const createPledge = async (req, res) => {
  try {
    const { name, rollNo, modeOfTransport, pledgeDate, userId, userEmail } = req.body;

    const pledge = new Pledge({
      name,
      rollNo,
      modeOfTransport,
      pledgeDate,
      userId,
      userEmail,
    });

    await pledge.save();
    
    // Broadcast updated count to all clients
    await broadcastPledgeCount();

    res.status(201).json({ 
      message: 'Pledge submitted successfully',
      pledge 
    });
  } catch (error) {
    console.error('Pledge creation error:', error);
    res.status(500).json({ error: 'Failed to submit pledge' });
  }
};

export const getPledges = async (req, res) => {
  try {
    const pledges = await Pledge.find().sort({ createdAt: -1 });
    res.json(pledges);
  } catch (error) {
    console.error('Get pledges error:', error);
    res.status(500).json({ error: 'Failed to fetch pledges' });
  }
};

export const getPledgeCount = async (req, res) => {
  try {
    const count = await Pledge.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Get pledge count error:', error);
    res.status(500).json({ error: 'Failed to fetch pledge count' });
  }
};