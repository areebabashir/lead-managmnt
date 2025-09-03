import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Campaign Classification
    type: {
        type: String,
        enum: ['email', 'sms', 'social_media', 'direct_mail', 'multi_channel', 'other'],
        default: 'email'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
        default: 'draft'
    },
    category: {
        type: String,
        enum: ['lead_generation', 'nurturing', 'conversion', 'retention', 'upsell', 'other'],
        default: 'lead_generation'
    },
    
    // Timeline & Scheduling
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    scheduledDate: {
        type: Date
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    
    // Target Audience
    targetAudience: {
        segments: [{
            type: String,
            trim: true
        }],
        tags: [{
            type: String,
            trim: true
        }],
        industries: [{
            type: String,
            trim: true
        }],
        leadTypes: [{
            type: String,
            enum: ['new', 'existing', 'first_time_buyer', 'repeat_customer', 'referral']
        }],
        customFilters: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    
    // Content & Templates
    emailTemplate: {
        subject: {
            type: String,
            trim: true
        },
        body: {
            type: String,
            trim: true
        },
        aiGenerated: {
            type: Boolean,
            default: false
        },
        personalizationFields: [{
            field: String,
            description: String
        }]
    },
    
    // AI Features
    aiSettings: {
        useAI: {
            type: Boolean,
            default: false
        },
        tone: {
            type: String,
            enum: ['professional', 'casual', 'friendly', 'formal', 'persuasive'],
            default: 'professional'
        },
        language: {
            type: String,
            default: 'en'
        },
        includePersonalization: {
            type: Boolean,
            default: true
        },
        suggestedFollowUp: {
            type: Boolean,
            default: true
        }
    },
    
    // Automation & Workflow
    automationRules: [{
        trigger: {
            type: String,
            enum: ['email_open', 'email_click', 'email_reply', 'link_click', 'form_submit', 'other'],
            required: true
        },
        action: {
            type: String,
            enum: ['send_follow_up', 'update_status', 'assign_task', 'send_notification', 'other'],
            required: true
        },
        delay: {
            type: Number, // minutes
            default: 0
        },
        parameters: {
            type: mongoose.Schema.Types.Mixed
        }
    }],
    
    // Performance Tracking
    metrics: {
        sent: {
            type: Number,
            default: 0
        },
        delivered: {
            type: Number,
            default: 0
        },
        opened: {
            type: Number,
            default: 0
        },
        clicked: {
            type: Number,
            default: 0
        },
        replied: {
            type: Number,
            default: 0
        },
        unsubscribed: {
            type: Number,
            default: 0
        },
        bounced: {
            type: Number,
            default: 0
        },
        converted: {
            type: Number,
            default: 0
        }
    },
    
    // Budget & ROI
    budget: {
        amount: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        },
        spent: {
            type: Number,
            default: 0
        }
    },
    roi: {
        revenue: {
            type: Number,
            default: 0
        },
        cost: {
            type: Number,
            default: 0
        }
    },
    
    // Assignment & Team
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer', 'approver'],
            default: 'viewer'
        }
    }],
    
    // Related Items
    relatedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    relatedContacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    }],
    
    // Notes & Communication
    notes: [{
        content: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Tags and Categories
    tags: [{
        type: String,
        trim: true
    }],
    
    // System Fields
    isActive: {
        type: Boolean,
        default: true
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
campaignSchema.index({ status: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ startDate: 1 });
campaignSchema.index({ assignedTo: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ createdAt: -1 });

// Virtual for open rate
campaignSchema.virtual('openRate').get(function() {
    if (this.metrics.delivered === 0) return 0;
    return Math.round((this.metrics.opened / this.metrics.delivered) * 100);
});

// Virtual for click rate
campaignSchema.virtual('clickRate').get(function() {
    if (this.metrics.delivered === 0) return 0;
    return Math.round((this.metrics.clicked / this.metrics.delivered) * 100);
});

// Virtual for reply rate
campaignSchema.virtual('replyRate').get(function() {
    if (this.metrics.delivered === 0) return 0;
    return Math.round((this.metrics.replied / this.metrics.delivered) * 100);
});

// Virtual for conversion rate
campaignSchema.virtual('conversionRate').get(function() {
    if (this.metrics.delivered === 0) return 0;
    return Math.round((this.metrics.converted / this.metrics.delivered) * 100);
});

// Virtual for ROI percentage
campaignSchema.virtual('roiPercentage').get(function() {
    if (this.roi.cost === 0) return 0;
    return Math.round(((this.roi.revenue - this.roi.cost) / this.roi.cost) * 100);
});

// Virtual for campaign duration in days
campaignSchema.virtual('durationDays').get(function() {
    if (!this.startDate || !this.endDate) return null;
    return Math.ceil((new Date(this.endDate) - new Date(this.startDate)) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update metrics
campaignSchema.pre('save', function(next) {
    // Ensure metrics are always numbers
    Object.keys(this.metrics).forEach(key => {
        if (typeof this.metrics[key] !== 'number') {
            this.metrics[key] = 0;
        }
    });
    next();
});

// Method to add note
campaignSchema.methods.addNote = function(content, userId) {
    this.notes.push({
        content,
        createdBy: userId,
        createdAt: new Date()
    });
    return this.save();
};

// Method to update status
campaignSchema.methods.updateStatus = function(newStatus, userId) {
    this.status = newStatus;
    this.updatedBy = userId;
    
    if (newStatus === 'active' && !this.startDate) {
        this.startDate = new Date();
    }
    
    if (newStatus === 'completed' && !this.endDate) {
        this.endDate = new Date();
    }
    
    return this.save();
};

// Method to update metrics
campaignSchema.methods.updateMetrics = function(metricType, count = 1) {
    if (this.metrics[metricType] !== undefined) {
        this.metrics[metricType] += count;
    }
    return this.save();
};

// Method to add team member
campaignSchema.methods.addTeamMember = function(userId, role = 'viewer') {
    const existingMember = this.team.find(member => member.user.toString() === userId.toString());
    if (existingMember) {
        existingMember.role = role;
    } else {
        this.team.push({ user: userId, role });
    }
    return this.save();
};

// Method to remove team member
campaignSchema.methods.removeTeamMember = function(userId) {
    this.team = this.team.filter(member => member.user.toString() !== userId.toString());
    return this.save();
};

// Static method to get campaigns by status
campaignSchema.statics.getCampaignsByStatus = function(status) {
    return this.find({ status, isActive: true }).populate('assignedTo', 'name email');
};

// Static method to get campaigns by type
campaignSchema.statics.getCampaignsByType = function(type) {
    return this.find({ type, isActive: true }).populate('assignedTo', 'name email');
};

// Static method to get active campaigns
campaignSchema.statics.getActiveCampaigns = function() {
    const now = new Date();
    return this.find({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true
    }).populate('assignedTo', 'name email');
};

// Static method to get campaigns by user
campaignSchema.statics.getCampaignsByUser = function(userId) {
    return this.find({
        $or: [
            { assignedTo: userId },
            { 'team.user': userId }
        ],
        isActive: true
    }).populate('assignedTo', 'name email');
};

export default mongoose.model('Campaign', campaignSchema);
