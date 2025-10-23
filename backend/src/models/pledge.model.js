import mongoose from 'mongoose';

const pledgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  pledgeText: {
    type: String,
    required: [true, 'Pledge text is required']
  },
  actions: [{
    type: String,
    trim: true
  }],
  location: {
    city: String,
    country: String
  },
  certificateId: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for certificate URL
pledgeSchema.virtual('certificateUrl').get(function() {
  if (this.certificateId) {
    return `/api/certificates/${this.certificateId}`;
  }
  return null;
});

// Add text index for searching
pledgeSchema.index({ name: 'text', pledgeText: 'text', 'location.city': 'text', 'location.country': 'text' });

export default mongoose.model('Pledge', pledgeSchema);