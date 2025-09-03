import mongoose from 'mongoose';

const userPermissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resource: {
        type: String,
        required: true,
        enum: [
            // Core CRM Resources
            'contacts', 'leads', 'customers', 'referrals',
            // Sales & Pipeline
            'pipeline', 'opportunities', 'deals', 'campaigns',
            // Communication
            'emails', 'communications', 'templates', 'ai_generator',
            // Calendar & Scheduling
            'calendar', 'appointments', 'meetings', 'reminders',
            // Task & Workflow
            'tasks', 'workflows', 'boards', 'automations',
            // Analytics & Reporting
            'reports', 'analytics', 'dashboards', 'kpis',
            // System & Admin
            'users', 'roles', 'permissions', 'integrations', 'settings',
            // Notes & Documents
            'notes', 'documents', 'files', 'dictation'
        ]
    },
    actions: [{
        type: String,
        enum: [
            'create', 'read', 'update', 'delete',
            'approve', 'reject', 'assign', 'export',
            'import', 'schedule', 'send', 'generate',
            'analyze', 'configure', 'integrate', 'dictate',
            'automate'
        ]
    }],
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Compound index to ensure unique user-resource combinations
userPermissionSchema.index({ userId: 1, resource: 1 }, { unique: true });

export default mongoose.model('UserPermission', userPermissionSchema);
