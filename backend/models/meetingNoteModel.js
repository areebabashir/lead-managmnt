import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    // For simple input participants
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    // For contact references
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    // Type to distinguish between simple and contact participants
    type: {
        type: String,
        enum: ['simple', 'contact'],
        required: true
    }
}, { _id: false });

const meetingNoteSchema = new mongoose.Schema({
    // Basic Information
    meetingTitle: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true
    },
    meetingDate: {
        type: Date,
        required: [true, 'Meeting date is required']
    },
    
    // Participants - Mixed array supporting both simple input and contact references
    participants: [participantSchema],
    
    // Audio and Processing
    audioFileUrl: {
        type: String,
        required: [true, 'Audio file URL is required'],
        trim: true
    },
    audioFileName: {
        type: String,
        trim: true
    },
    audioFileSize: {
        type: Number
    },
    
    // Transcript and Summary
    transcription: {
        type: String,
        trim: true
    },
    rawTranscriptData: {
        type: mongoose.Schema.Types.Mixed // Store original Google API response
    },
    summary: {
        type: String,
        trim: true
    },
    
    // Processing Status
    transcriptionStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    summaryStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    
    // Metadata
    duration: {
        type: String // e.g., "10s" from Google API
    },
    language: {
        type: String,
        default: 'en-US'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    
    // Tags and Categories
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true
    },
    
    // System Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
meetingNoteSchema.index({ meetingDate: -1 });
meetingNoteSchema.index({ createdBy: 1, meetingDate: -1 });
meetingNoteSchema.index({ transcriptionStatus: 1 });
meetingNoteSchema.index({ summaryStatus: 1 });
meetingNoteSchema.index({ tags: 1 });

// Virtual for formatted participants display
meetingNoteSchema.virtual('formattedParticipants').get(function() {
    return this.participants.map(participant => {
        if (participant.type === 'contact') {
            return participant.contactId ? `${participant.contactId.fullName} (${participant.contactId.email})` : 'Contact';
        } else {
            return participant.email ? `${participant.name} (${participant.email})` : participant.name;
        }
    });
});

// Method to add simple participant
meetingNoteSchema.methods.addSimpleParticipant = function(name, email) {
    this.participants.push({
        name: name,
        email: email,
        type: 'simple'
    });
};

// Method to add contact participant
meetingNoteSchema.methods.addContactParticipant = function(contactId) {
    this.participants.push({
        contactId: contactId,
        type: 'contact'
    });
};

// Method to update transcription status
meetingNoteSchema.methods.updateTranscriptionStatus = function(status, transcription = null, rawData = null) {
    this.transcriptionStatus = status;
    if (transcription) {
        this.transcription = transcription;
    }
    if (rawData) {
        this.rawTranscriptData = rawData;
    }
    return this.save();
};

// Method to update summary status
meetingNoteSchema.methods.updateSummaryStatus = function(status, summary = null) {
    this.summaryStatus = status;
    if (summary) {
        this.summary = summary;
    }
    return this.save();
};

// Static method to get meeting notes by user
meetingNoteSchema.statics.getMeetingNotesByUser = function(userId, limit = 20, skip = 0) {
    return this.find({ createdBy: userId, isActive: true })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('participants.contactId', 'fullName email company')
        .sort({ meetingDate: -1 })
        .limit(limit)
        .skip(skip);
};

// Static method to get recent meeting notes
meetingNoteSchema.statics.getRecentMeetingNotes = function(limit = 10) {
    return this.find({ isActive: true })
        .populate('createdBy', 'name email')
        .populate('participants.contactId', 'fullName email company')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to search meeting notes
meetingNoteSchema.statics.searchMeetingNotes = function(query, userId = null) {
    const searchCriteria = {
        isActive: true,
        $or: [
            { meetingTitle: { $regex: query, $options: 'i' } },
            { transcription: { $regex: query, $options: 'i' } },
            { summary: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };

    if (userId) {
        searchCriteria.createdBy = userId;
    }

    return this.find(searchCriteria)
        .populate('createdBy', 'name email')
        .populate('participants.contactId', 'fullName email company')
        .sort({ meetingDate: -1 });
};

// Pre-save middleware to update updatedBy field
meetingNoteSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedBy = this.createdBy; // Will be overridden by controller if different user
    }
    next();
});

const MeetingNote = mongoose.model('MeetingNote', meetingNoteSchema);

export default MeetingNote;

