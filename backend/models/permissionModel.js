import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    resource: {
        type: String,
        required: true,
        enum: [
            // Core CRM Resources
            'contacts', 'leads', 'customers', 
            // Sales & Pipeline
           'opportunities', 'campaigns',
            // Communication
             'ai_generator',
            // Calendar & Scheduling
            'calendar', 'appointments',  'reminders',
            // Task & Workflow
            'tasks', 
            // Analytics & Reporting
            'reports', 'analytics', 'dashboards',
            // System & Admin
            'users', 'roles', 'permissions',  'settings',
            // Notes & Documents
            'notes'
        ]
    },
    action: {
        type: String,
        required: true,
        enum: [
            'create', 'read', 'update', 'delete',
            'approve', 'reject', 'assign', 'export',
            'import', 'schedule', 'send', 'generate',
            'analyze', 'configure', 'integrate', 'dictate',
            'automate'
        ]
    },
    description: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    // Create compound index to ensure unique resource-action combinations
    indexes: [
        { resource: 1, action: 1 }, { unique: true }
    ]
});

// Virtual for permission string (e.g., "contacts:create")
permissionSchema.virtual('permissionString').get(function() {
    return `${this.resource}:${this.action}`;
});

// Ensure virtual fields are serialized
permissionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Permission', permissionSchema);
