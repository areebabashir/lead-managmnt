import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    jobTitle: {
        type: String,
        trim: true
    },
    
    // Contact Information
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    
    // Address & Location
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    searchArea: {
        type: String,
        trim: true,
        description: 'Geographic area of interest for real estate or services'
    },
    
    // Personal Information
    birthday: {
        type: Date
    },
    anniversary: {
        type: Date
    },
    
    // Lead & Customer Classification
    leadType: {
        type: String,
        enum: ['new', 'existing', 'first_time_buyer', 'repeat_customer', 'referral'],
        default: 'new'
    },
    status: {
        type: String,
        enum: ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'inactive'],
        default: 'prospect'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    // Referral Information
    referral: {
        isReferral: {
            type: Boolean,
            default: false
        },
        referrer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact'
        },
        referralDate: {
            type: Date
        },
        referralNotes: {
            type: String
        }
    },
    
    // Financial Information
    priceRange: {
        min: {
            type: Number,
            min: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    estimatedValue: {
        type: Number,
        min: 0
    },
    
    // Purchase History
    purchaseHistory: [{
        product: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'cancelled'],
            default: 'completed'
        }
    }],
    
    // Interaction Tracking
    lastInteractionDate: {
        type: Date,
        default: Date.now
    },
    lastInteractionType: {
        type: String,
        enum: ['email', 'phone', 'meeting', 'text', 'social_media', 'other']
    },
    nextFollowUpDate: {
        type: Date
    },
    followUpNotes: {
        type: String
    },
    
    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    
    // Notes and Communication
    notes: [{
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['general', 'follow_up', 'meeting', 'call', 'email', 'other'],
            default: 'general'
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
    industry: {
        type: String,
        trim: true
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'cold_call', 'social_media', 'advertising', 'event', 'facebook', 'zapier', 'other'],
        default: 'website'
    },
    // Facebook Lead Ads specific fields
    facebookLeadId: {
        type: String,
        trim: true
    },
    facebookAdId: {
        type: String,
        trim: true
    },
    facebookFormId: {
        type: String,
        trim: true
    },
    facebookPageId: {
        type: String,
        trim: true
    },
    // Zapier integration fields
    zapierWebhookId: {
        type: String,
        trim: true
    },
    leadSourceDetails: {
        platform: String, // 'facebook', 'instagram', 'google', etc.
        campaign: String,
        adSet: String,
        ad: String,
        form: String
    },
    
    // System Fields
    isActive: {
        type: Boolean,
        default: true
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
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ leadType: 1 });
contactSchema.index({ lastInteractionDate: -1 });
contactSchema.index({ nextFollowUpDate: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ 'referral.referrer': 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for contact age in days
contactSchema.virtual('contactAge').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last interaction
contactSchema.virtual('daysSinceLastInteraction').get(function() {
    if (!this.lastInteractionDate) return null;
    return Math.floor((Date.now() - this.lastInteractionDate) / (1000 * 60 * 60 * 24));
});

// Virtual for total purchase value
contactSchema.virtual('totalPurchaseValue').get(function() {
    return this.purchaseHistory.reduce((total, purchase) => {
        return purchase.status === 'completed' ? total + purchase.amount : total;
    }, 0);
});

// Pre-save middleware to update lastInteractionDate
contactSchema.pre('save', function(next) {
    if (this.isModified('notes') && this.notes.length > 0) {
        this.lastInteractionDate = new Date();
    }
    next();
});

// Method to add note
contactSchema.methods.addNote = function(content, type, userId) {
    this.notes.push({
        content,
        type,
        createdBy: userId,
        createdAt: new Date()
    });
    this.lastInteractionDate = new Date();
    return this.save();
};

// Method to update status
contactSchema.methods.updateStatus = function(newStatus, userId) {
    this.status = newStatus;
    this.updatedBy = userId;
    return this.save();
};

// Method to add purchase
contactSchema.methods.addPurchase = function(product, amount, status = 'completed') {
    this.purchaseHistory.push({
        product,
        amount,
        date: new Date(),
        status
    });
    return this.save();
};

// Method to update last interaction
contactSchema.methods.updateLastInteraction = function(interactionType) {
    this.lastInteractionDate = new Date();
    this.lastInteractionType = interactionType;
    return this.save();
};

// Static method to get contacts by status
contactSchema.statics.getContactsByStatus = function(status) {
    return this.find({ status, isActive: true }).populate('assignedTo', 'name email');
};

// Static method to get contacts by assigned user
contactSchema.statics.getContactsByUser = function(userId) {
    return this.find({ assignedTo: userId, isActive: true }).populate('assignedTo', 'name email');
};

// Static method to get contacts needing follow-up
contactSchema.statics.getContactsNeedingFollowUp = function() {
    const today = new Date();
    return this.find({
        nextFollowUpDate: { $lte: today },
        isActive: true
    }).populate('assignedTo', 'name email');
};

// Static method to get referral contacts
contactSchema.statics.getReferralContacts = function() {
    return this.find({
        'referral.isReferral': true,
        isActive: true
    }).populate('referral.referrer', 'firstName lastName email');
};

export default mongoose.model('Contact', contactSchema);
