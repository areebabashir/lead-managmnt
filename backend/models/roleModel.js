import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
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
    }]
});

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['system', 'sales', 'management', 'support'],
        default: 'sales'
    },
    permissions: [permissionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1, // 1=Basic, 2=Intermediate, 3=Advanced, 4=Admin, 5=Super
        min: 1,
        max: 5
    }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
