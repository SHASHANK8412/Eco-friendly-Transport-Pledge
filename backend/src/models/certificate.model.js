import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: [true, 'Certificate ID is required'],
    unique: true
  },
  pledgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pledge',
    required: [true, 'Pledge ID is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true
  },
  recipientEmail: {
    type: String,
    required: [true, 'Recipient email is required'],
    trim: true,
    lowercase: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  pdfData: {
    type: Buffer,
    required: [true, 'PDF data is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  verificationUrl: {
    type: String
  },
  isEmailSent: {
    type: Boolean,
    default: false
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

// Generate the verification URL
certificateSchema.pre('save', function(next) {
  if (!this.verificationUrl) {
    this.verificationUrl = `/verify-certificate/${this.certificateId}`;
  }
  next();
});

export default mongoose.model('Certificate', certificateSchema);