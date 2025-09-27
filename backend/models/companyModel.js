import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        minlength: [2, 'Company name must be at least 2 characters']
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    logo: {
        type: String,
        default: null,
        trim: true
    },
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

// Index for better query performance
companySchema.index({ name: 1 });

// Virtual for company age in days
companySchema.virtual('companyAge').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update updatedBy
companySchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedBy = this.createdBy; // You can modify this to track actual updater
    }
    next();
});

// Static method to get company (since we're using single company setup)
companySchema.statics.getCompany = function() {
    return this.findOne({ isActive: true });
};

// Static method to create or update company
companySchema.statics.createOrUpdate = function(companyData, userId) {
    return this.findOneAndUpdate(
        { isActive: true },
        { 
            ...companyData, 
            updatedBy: userId,
            createdBy: companyData.createdBy || userId
        },
        { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true 
        }
    );
};

export default mongoose.model('Company', companySchema);
