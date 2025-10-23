import dotenv from 'dotenv';

// Configure environment variables FIRST
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeFirebaseAdmin } from './config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  initializeFirebaseAdmin();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.log('Note: Firebase Admin requires service account credentials for production');
}

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from the public directory
const publicPath = path.join(__dirname, '../public');
app.use('/certificates', express.static(path.join(publicPath, 'certificates')));
console.log('Static files served from:', path.join(publicPath, 'certificates'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection by running a simple query
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('❗ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import routes
import testRoutes from './routes/test.routes.js';
import pledgeRoutes from './routes/pledges.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import certificateRoutes from './routes/certificates.routes.js';
import userRoutes from './routes/users.routes.js';
import statsRoutes from './routes/stats.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Routes
app.use('/api/test', testRoutes);
app.use('/api/pledges', pledgeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Eco-Friendly Pledge API',
    version: '1.0.0',
    endpoints: [
      '/api/pledges',
      '/api/feedback',
      '/api/certificates',
      '/api/users',
      '/api/stats'
    ]
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send initial pledge count
  sendPledgeCount(ws);
  
  // Handle client messages
  ws.on('message', (message) => {
    console.log('Received message from client:', message);
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to send pledge count to all connected clients
const sendPledgeCount = async (ws) => {
  try {
    const count = await mongoose.models.Pledge.countDocuments();
    ws.send(JSON.stringify({ type: 'pledgeCount', count }));
  } catch (error) {
    console.error('Error sending pledge count:', error);
  }
};

// Broadcast pledge count to all clients
const broadcastPledgeCount = async () => {
  try {
    const count = await mongoose.models.Pledge.countDocuments();
    wss.clients.forEach(client => {
      // Use the correct constant from the ws library
      if (client.readyState === 1) { // 1 is OPEN in WebSocket
        client.send(JSON.stringify({ type: 'pledgeCount', count }));
      }
    });
  } catch (error) {
    console.error('Error broadcasting pledge count:', error);
  }
};

// Make broadcastPledgeCount available globally
global.broadcastPledgeCount = broadcastPledgeCount;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});