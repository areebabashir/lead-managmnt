import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    // Required Fields
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    streetAddress: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    province: {
        type: String,
        required: [true, 'Province is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    status: {
        type: String,
        enum: ['New', 'Existing', 'First-Time Buyer'],
        default: 'New',
        required: true
    },
    
    // Optional Fields
    anniversary: {
        type: Date
    },
    leadType: {
        type: String,
        trim: true
    },
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
    searchArea: {
        type: String,
        trim: true,
        description: 'Geographic area of interest for real estate or services'
    },
    lastInteractionDate: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'cold_call', 'social_media', 'advertising', 'event', 'facebook', 'zapier', 'other'],
        default: 'website'
    },
    
    // System Fields
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ lastInteractionDate: -1 });
contactSchema.index({ 'referral.referrer': 1 });

// Virtual for contact age in days
contactSchema.virtual('contactAge').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last interaction
contactSchema.virtual('daysSinceLastInteraction').get(function() {
    if (!this.lastInteractionDate) return null;
    return Math.floor((Date.now() - this.lastInteractionDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastInteractionDate
contactSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastInteractionDate = new Date();
    }
    next();
});

// Method to update status
contactSchema.methods.updateStatus = function(newStatus, userId) {
    this.status = newStatus;
    this.updatedBy = userId;
    return this.save();
};

// Method to update last interaction
contactSchema.methods.updateLastInteraction = function() {
    this.lastInteractionDate = new Date();
    return this.save();
};

// Static method to get contacts by status
contactSchema.statics.getContactsByStatus = function(status) {
    return this.find({ status, isActive: true });
};

// Static method to get referral contacts
contactSchema.statics.getReferralContacts = function() {
    return this.find({
        'referral.isReferral': true,
        isActive: true
    }).populate('referral.referrer', 'fullName email');
};

export default mongoose.model('Contact', contactSchema);