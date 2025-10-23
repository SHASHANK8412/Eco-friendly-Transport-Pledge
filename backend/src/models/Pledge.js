import mongoose from 'mongoose';

const pledgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  modeOfTransport: {
    type: String,
    required: true,
  },
  pledgeDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
  },
});

export default mongoose.model('Pledge', pledgeSchema);