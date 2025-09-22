import mongoose from 'mongoose';

const smsSchema = new mongoose.Schema({
  // Message content
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Sender information
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Recipient information
  recipientType: {
    type: String,
    enum: ['lead', 'staff'],
    required: true
  },
  
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  recipientName: {
    type: String,
    required: true
  },
  
  recipientPhone: {
    type: String,
    required: true
  },
  
  // Twilio information
  twilioSid: {
    type: String,
    required: true
  },
  
  twilioStatus: {
    type: String,
    enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered'],
    default: 'queued'
  },
  
  twilioErrorCode: {
    type: String
  },
  
  twilioErrorMessage: {
    type: String
  },
  
  // Message metadata
  messageLength: {
    type: Number,
    required: true
  },
  
  segments: {
    type: Number,
    default: 1
  },
  
  cost: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  deliveredAt: {
    type: Date
  },
  
  // Status tracking
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
smsSchema.index({ sentBy: 1, createdAt: -1 });
smsSchema.index({ recipientId: 1, recipientType: 1 });
smsSchema.index({ twilioSid: 1 });
smsSchema.index({ twilioStatus: 1 });

// Virtual for recipient reference
smsSchema.virtual('recipient', {
  refPath: 'recipientType',
  localField: 'recipientId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
smsSchema.set('toJSON', { virtuals: true });

const SMS = mongoose.model('SMS', smsSchema);

export default SMS;

