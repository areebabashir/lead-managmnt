import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'followup', 'summary', 'dictation', 'custom'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  metadata: {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    context: {
      type: String,
      default: ''
    },
    tokens: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      default: 'gemini-pro'
    }
  },
  cacheKey: {
    type: String,
    index: true
  },
  isCached: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const aiPromptCacheSchema = new mongoose.Schema({
  promptHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  response: {
    type: String,
    required: true
  },
  usageCount: {
    type: Number,
    default: 1
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const aiAssistantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  settings: {
    defaultModel: {
      type: String,
      default: 'gemini-pro'
    },
    maxCacheSize: {
      type: Number,
      default: 1000
    },
    enableCaching: {
      type: Boolean,
      default: true
    },
    enableAnalytics: {
      type: Boolean,
      default: true
    }
  },
  usage: {
    totalInteractions: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
aiInteractionSchema.index({ userId: 1, createdAt: -1 });
aiInteractionSchema.index({ type: 1, userId: 1 });
aiPromptCacheSchema.index({ lastUsed: -1 });

// Virtual for interaction age
aiInteractionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to check if cache is still valid (7 days)
aiPromptCacheSchema.methods.isValid = function() {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return (Date.now() - this.lastUsed.getTime()) < sevenDays;
};

// Method to update usage
aiPromptCacheSchema.methods.updateUsage = function() {
  this.usageCount += 1;
  this.lastUsed = Date.now();
  return this.save();
};

const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
const AIPromptCache = mongoose.model('AIPromptCache', aiPromptCacheSchema);
const AIAssistant = mongoose.model('AIAssistant', aiAssistantSchema);

export { AIInteraction, AIPromptCache, AIAssistant };
