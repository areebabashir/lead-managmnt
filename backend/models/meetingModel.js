import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['meeting', 'appointment', 'call', 'personal'],
        default: 'meeting'
    },
    date: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    attendees: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    reminder: {
        type: Number,
        default: 15 // minutes before
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Index for better query performance
meetingSchema.index({ date: 1, startTime: 1 });
meetingSchema.index({ createdBy: 1, date: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model('Meeting', meetingSchema);
