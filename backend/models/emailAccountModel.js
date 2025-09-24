import mongoose from "mongoose";

const emailAccountSchema = new mongoose.Schema({
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },

  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },          // e.g. "sales@company.com"
  displayName: { 
    type: String,
    trim: true
  },                    // optional name

  google: {
    refreshToken: { type: String, required: true }, // ONE token for both Gmail + Calendar
    accessToken: { type: String },                  // optional, auto-refreshed
    expiryDate: { type: Date },                     // when token expires
    scopes: [String],                               // list of granted scopes
  },

  settings: {
    syncInbox: { type: Boolean, default: true },
    syncCalendar: { type: Boolean, default: true },
  },

  metadata: {
    lastSynced: { type: Date },                     // last time we synced inbox
    historyId: { type: String },                    // Gmail history for delta sync
  },

  isActive: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Indexes for better query performance
emailAccountSchema.index({ company: 1 });
emailAccountSchema.index({ email: 1 });
emailAccountSchema.index({ isActive: 1 });

// Pre-save middleware to update updatedAt
emailAccountSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Static method to get email accounts by company
emailAccountSchema.statics.getByCompany = function(companyId) {
  return this.find({ company: companyId });
};

// Static method to get active email account
emailAccountSchema.statics.getActiveAccount = function(companyId) {
  return this.findOne({ company: companyId, isActive: true });
};

// Static method to activate an email account (only one can be active at a time)
emailAccountSchema.statics.activateAccount = async function(accountId, companyId) {
  try {
    // First, deactivate all other accounts for this company
    await this.updateMany(
      { company: companyId, _id: { $ne: accountId } },
      { isActive: false }
    );
    
    // Then activate the specified account
    const activatedAccount = await this.findByIdAndUpdate(
      accountId,
      { isActive: true },
      { new: true }
    );
    
    return activatedAccount;
  } catch (error) {
    console.error('Error activating email account:', error);
    throw error;
  }
};

// Method to update sync metadata
emailAccountSchema.methods.updateSyncMetadata = function(historyId) {
  this.metadata.lastSynced = new Date();
  if (historyId) {
    this.metadata.historyId = historyId;
  }
  return this.save();
};

// Method to update Google tokens
emailAccountSchema.methods.updateGoogleTokens = function(tokens) {
  this.google.accessToken = tokens.access_token;
  this.google.refreshToken = tokens.refresh_token;
  this.google.expiryDate = new Date(tokens.expiry_date);
  this.google.scopes = tokens.scope ? tokens.scope.split(' ') : [];
  return this.save();
};

export default mongoose.model("EmailAccount", emailAccountSchema);

