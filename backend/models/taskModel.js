import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Task Classification
    type: {
        type: String,
        enum: ['task', 'lead', 'follow_up', 'meeting', 'call', 'email', 'campaign', 'other'],
        default: 'task'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'review', 'done', 'cancelled'],
        default: 'todo'
    },
    
    // Board & Workflow Management
    board: {
        type: String,
        required: [true, 'Board name is required'],
        trim: true
    },
    column: {
        type: String,
        required: [true, 'Column name is required'],
        trim: true
    },
    position: {
        type: Number,
        default: 0
    },
    
    // Timeline & Scheduling
    dueDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    estimatedDuration: {
        hours: {
            type: Number,
            min: 0
        },
        minutes: {
            type: Number,
            min: 0,
            max: 59
        }
    },
    actualDuration: {
        hours: {
            type: Number,
            min: 0
        },
        minutes: {
            type: Number,
            min: 0,
            max: 59
        }
    },
    
    // Assignment & Collaboration
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
    
    // Related Items
    relatedContact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    relatedDeal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal'
    },
    relatedCampaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    
    // Progress Tracking
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    checkList: [{
        item: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: {
            type: Date
        }
    }],
    
    // Communication & Notes
    comments: [{
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
        },
        attachments: [{
            filename: String,
            originalName: String,
            mimeType: String,
            size: Number,
            url: String
        }]
    }],
    
    // File Attachments
    attachments: [{
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Tags and Categories
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true
    },
    
    // Dependencies
    dependencies: [{
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        type: {
            type: String,
            enum: ['blocks', 'blocked_by', 'related'],
            default: 'blocks'
        }
    }],
    
    // Automation & Rules
    automationRules: [{
        trigger: {
            type: String,
            enum: ['status_change', 'due_date', 'assignment', 'completion'],
            required: true
        },
        action: {
            type: String,
            enum: ['send_email', 'create_task', 'update_status', 'notify_user', 'other'],
            required: true
        },
        parameters: {
            type: mongoose.Schema.Types.Mixed
        }
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
taskSchema.index({ board: 1, column: 1, position: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ relatedContact: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for estimated duration in minutes
taskSchema.virtual('estimatedDurationMinutes').get(function() {
    if (!this.estimatedDuration) return 0;
    return (this.estimatedDuration.hours * 60) + this.estimatedDuration.minutes;
});

// Virtual for actual duration in minutes
taskSchema.virtual('actualDurationMinutes').get(function() {
    if (!this.actualDuration) return 0;
    return (this.actualDuration.hours * 60) + this.actualDuration.minutes;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
    if (!this.dueDate) return null;
    const now = new Date();
    const due = new Date(this.dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
taskSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.status === 'done' || this.status === 'cancelled') return false;
    return new Date() > new Date(this.dueDate);
});

// Pre-save middleware to update progress based on checklist
taskSchema.pre('save', function(next) {
    if (this.checkList && this.checkList.length > 0) {
        const completedItems = this.checkList.filter(item => item.completed).length;
        this.progress = Math.round((completedItems / this.checkList.length) * 100);
    }
    next();
});

// Method to add comment
taskSchema.methods.addComment = function(content, userId, attachments = []) {
    this.comments.push({
        content,
        createdBy: userId,
        createdAt: new Date(),
        attachments
    });
    return this.save();
};

// Method to add checklist item
taskSchema.methods.addChecklistItem = function(item) {
    this.checkList.push({
        item,
        completed: false
    });
    return this.save();
};

// Method to complete checklist item
taskSchema.methods.completeChecklistItem = function(itemIndex, userId) {
    if (this.checkList[itemIndex]) {
        this.checkList[itemIndex].completed = true;
        this.checkList[itemIndex].completedBy = userId;
        this.checkList[itemIndex].completedAt = new Date();
    }
    return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(newStatus, userId) {
    this.status = newStatus;
    this.updatedBy = userId;
    
    if (newStatus === 'done') {
        this.actualDuration = this.estimatedDuration;
    }
    
    return this.save();
};

// Method to move to column
taskSchema.methods.moveToColumn = function(newColumn, newPosition) {
    this.column = newColumn;
    this.position = newPosition;
    return this.save();
};

// Method to add attachment
taskSchema.methods.addAttachment = function(attachment, userId) {
    this.attachments.push({
        ...attachment,
        uploadedBy: userId,
        uploadedAt: new Date()
    });
    return this.save();
};

// Static method to get tasks by board
taskSchema.statics.getTasksByBoard = function(boardName) {
    return this.find({ board: boardName, isActive: true })
        .sort({ column: 1, position: 1 })
        .populate('assignedTo', 'name email')
        .populate('relatedContact', 'firstName lastName company');
};

// Static method to get tasks by user
taskSchema.statics.getTasksByUser = function(userId) {
    return this.find({ assignedTo: userId, isActive: true })
        .sort({ dueDate: 1, priority: -1 })
        .populate('relatedContact', 'firstName lastName company');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
    const now = new Date();
    return this.find({
        dueDate: { $lt: now },
        status: { $nin: ['done', 'cancelled'] },
        isActive: true
    }).populate('assignedTo', 'name email');
};

// Static method to get tasks due today
taskSchema.statics.getTasksDueToday = function() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.find({
        dueDate: { $gte: today, $lt: tomorrow },
        isActive: true
    }).populate('assignedTo', 'name email');
};

export default mongoose.model('Task', taskSchema);
