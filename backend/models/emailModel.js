import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  // Basic Email Information
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Email body is required']
  },
  
  // Recipient Information
  recipient: {
    email: {
      type: String,
      required: [true, 'Recipient email is required'],
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: false
    }
  },
  
  // Sender Information
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  
  // Email Status and Type
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled', 'received'],
    default: 'draft'
  },
  emailType: {
    type: String,
    enum: ['follow_up', 'introduction', 'proposal', 'reminder', 'thank_you', 'custom'],
    default: 'custom'
  },
  
  // Scheduling Information
  scheduledDate: {
    type: Date,
    required: function() {
      return this.status === 'scheduled';
    }
  },
  sentDate: {
    type: Date
  },
  
  // AI Generation Context
  aiContext: {
    emailType: String,
    tone: String,
    keyPoints: [String],
    callToAction: String,
    customInstructions: String,
    generatedBy: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'manual'
    },
    aiInteractionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIInteraction'
    }
  },
  
  // Email Metadata
  metadata: {
    gmailMessageId: String,
    threadId: String,
    labels: [String],
    attachments: [{
      filename: String,
      contentType: String,
      size: Number,
      url: String,
      attachmentId: String
    }],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    tags: [String],
    // Gmail specific fields
    gmailLabels: [String], // Gmail label IDs
    isRead: {
      type: Boolean,
      default: false
    },
    isStarred: {
      type: Boolean,
      default: false
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    receivedDate: Date,
    emailDirection: {
      type: String,
      enum: ['sent', 'received'],
      default: 'sent'
    }
  },
  
  // Tracking and Analytics
  tracking: {
    opened: {
      type: Boolean,
      default: false
    },
    openedAt: Date,
    clicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    replied: {
      type: Boolean,
      default: false
    },
    repliedAt: Date,
    bounceReason: String
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastError: {
    message: String,
    timestamp: Date,
    code: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailSchema.index({ 'recipient.email': 1 });
emailSchema.index({ 'sender.userId': 1 });
emailSchema.index({ status: 1 });
emailSchema.index({ scheduledDate: 1 });
emailSchema.index({ sentDate: -1 });
emailSchema.index({ 'recipient.contactId': 1 });
emailSchema.index({ createdAt: -1 });
// Inbox specific indexes
emailSchema.index({ 'metadata.emailDirection': 1, 'metadata.receivedDate': -1 });
emailSchema.index({ 'metadata.isRead': 1 });
emailSchema.index({ 'metadata.isStarred': 1 });
emailSchema.index({ 'metadata.threadId': 1 });
emailSchema.index({ 'metadata.gmailMessageId': 1 });

// Virtual for email age in hours
emailSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for days until scheduled
emailSchema.virtual('daysUntilScheduled').get(function() {
  if (!this.scheduledDate) return null;
  return Math.ceil((this.scheduledDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate scheduled emails
emailSchema.pre('save', function(next) {
  if (this.status === 'scheduled' && this.scheduledDate && this.scheduledDate <= new Date()) {
    return next(new Error('Scheduled date must be in the future'));
  }
  next();
});

// Method to update status
emailSchema.methods.updateStatus = function(newStatus, metadata = {}) {
  this.status = newStatus;
  
  if (newStatus === 'sent') {
    this.sentDate = new Date();
  }
  
  if (metadata.error) {
    this.lastError = {
      message: metadata.error.message,
      timestamp: new Date(),
      code: metadata.error.code
    };
    this.retryCount += 1;
  }
  
  return this.save();
};

// Method to mark as opened
emailSchema.methods.markAsOpened = function() {
  if (!this.tracking.opened) {
    this.tracking.opened = true;
    this.tracking.openedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as clicked
emailSchema.methods.markAsClicked = function() {
  if (!this.tracking.clicked) {
    this.tracking.clicked = true;
    this.tracking.clickedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as replied
emailSchema.methods.markAsReplied = function() {
  if (!this.tracking.replied) {
    this.tracking.replied = true;
    this.tracking.repliedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get emails by status
emailSchema.statics.getEmailsByStatus = function(status, userId = null) {
  const query = { status, isActive: true };
  if (userId) {
    query['sender.userId'] = userId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get scheduled emails ready to send
emailSchema.statics.getScheduledEmailsToSend = function() {
  return this.find({
    status: 'scheduled',
    scheduledDate: { $lte: new Date() },
    isActive: true
  }).populate('sender.userId', 'name email').populate('recipient.contactId', 'fullName email');
};

// Static method to get email statistics
emailSchema.statics.getEmailStats = function(userId = null) {
  const matchStage = { isActive: true };
  if (userId) {
    matchStage['sender.userId'] = new mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get emails by contact
emailSchema.statics.getEmailsByContact = function(contactId, userId = null) {
  const query = { 'recipient.contactId': contactId, isActive: true };
  if (userId) {
    query['sender.userId'] = userId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get received emails (inbox)
emailSchema.statics.getReceivedEmails = function(userId, options = {}) {
  const query = { 
    'metadata.emailDirection': 'received',
    isActive: true 
  };
  
  if (options.unreadOnly) {
    query['metadata.isRead'] = false;
  }
  
  if (options.starredOnly) {
    query['metadata.isStarred'] = true;
  }
  
  if (options.label) {
    query['metadata.gmailLabels'] = options.label;
  }
  
  return this.find(query)
    .sort({ 'metadata.receivedDate': -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get email threads
emailSchema.statics.getEmailThread = function(threadId) {
  return this.find({ 
    'metadata.threadId': threadId,
    isActive: true 
  }).sort({ 'metadata.receivedDate': 1 });
};

// Method to mark email as read/unread
emailSchema.methods.markAsRead = function(isRead = true) {
  this.metadata.isRead = isRead;
  return this.save();
};

// Method to star/unstar email
emailSchema.methods.toggleStar = function() {
  this.metadata.isStarred = !this.metadata.isStarred;
  return this.save();
};

const Email = mongoose.model('Email', emailSchema);

export default Email;
