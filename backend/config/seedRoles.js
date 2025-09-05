
import Role from '../models/roleModel.js';
import User from '../models/authModel.js';
import { hashPassword } from '../helpers/authHelper.js';

export const seedDefaultRoles = async () => {
    try {
        // Check if roles already exist
        const existingRoles = await Role.countDocuments();
        if (existingRoles > 0) {
            console.log('Roles already seeded, skipping...');
            return;
        }

        // Create default roles for Melnitz AI Sales Assistant
        const defaultRoles = [
            {
                name: 'Super Admin',
                description: 'Full system access with all permissions across all modules',
                category: 'system',
                level: 5,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['create', 'read', 'update', 'delete', 'import', 'export', 'assign'] },
                    { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'import', 'export', 'assign'] },
                    { resource: 'customers', actions: ['create', 'read', 'update', 'delete', 'import', 'export', 'assign'] },
                    { resource: 'referrals', actions: ['create', 'read', 'update', 'delete', 'import', 'export', 'assign'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['create', 'read', 'update', 'delete', 'configure', 'analyze'] },
                    { resource: 'opportunities', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'assign'] },
                    { resource: 'deals', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'assign'] },
                    { resource: 'campaigns', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'configure'] },
                    // Communication
                    { resource: 'emails', actions: ['create', 'read', 'update', 'delete', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['create', 'read', 'update', 'delete', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['create', 'read', 'update', 'delete', 'configure'] },
                    { resource: 'ai_generator', actions: ['create', 'read', 'update', 'delete', 'generate', 'configure'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete', 'schedule', 'integrate'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete', 'schedule', 'approve'] },
                    { resource: 'meetings', actions: ['create', 'read', 'update', 'delete', 'schedule', 'approve'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'delete', 'schedule', 'configure'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign', 'approve', 'reject'] },
                    { resource: 'workflows', actions: ['create', 'read', 'update', 'delete', 'configure', 'automate'] },
                    { resource: 'boards', actions: ['create', 'read', 'update', 'delete', 'configure', 'assign'] },
                    { resource: 'automations', actions: ['create', 'read', 'update', 'delete', 'configure', 'integrate'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'analyze', 'configure'] },
                    { resource: 'dashboards', actions: ['create', 'read', 'update', 'delete', 'configure', 'analyze'] },
                    { resource: 'kpis', actions: ['create', 'read', 'update', 'delete', 'configure', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'permissions', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'configure', 'integrate'] },
                    { resource: 'settings', actions: ['create', 'read', 'update', 'delete', 'configure'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'delete', 'dictate'] },
                    { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'import', 'export'] },
                    { resource: 'files', actions: ['create', 'read', 'update', 'delete', 'import', 'export'] },
                    { resource: 'dictation', actions: ['create', 'read', 'update', 'delete', 'dictate', 'configure'] }
                ],
                isSystem: true
            },
            {
                name: 'Sales Director',
                description: 'Executive level access to all sales operations and analytics',
                category: 'management',
                level: 4,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'leads', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'customers', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'referrals', actions: ['read', 'update', 'export', 'assign'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['read', 'update', 'configure', 'analyze'] },
                    { resource: 'opportunities', actions: ['read', 'update', 'approve', 'reject', 'assign'] },
                    { resource: 'deals', actions: ['read', 'update', 'approve', 'reject', 'assign'] },
                    { resource: 'campaigns', actions: ['read', 'update', 'approve', 'reject', 'configure'] },
                    // Communication
                    { resource: 'emails', actions: ['read', 'update', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['read', 'update', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['read', 'update', 'configure'] },
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate', 'configure'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule', 'integrate'] },
                    { resource: 'appointments', actions: ['read', 'update', 'schedule', 'approve'] },
                    { resource: 'meetings', actions: ['read', 'update', 'schedule', 'approve'] },
                    { resource: 'reminders', actions: ['read', 'update', 'schedule', 'configure'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update', 'assign', 'approve', 'reject'] },
                    { resource: 'workflows', actions: ['read', 'update', 'configure', 'automate'] },
                    { resource: 'boards', actions: ['read', 'update', 'configure', 'assign'] },
                    { resource: 'automations', actions: ['read', 'update', 'configure', 'integrate'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'update', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'update', 'analyze', 'configure'] },
                    { resource: 'dashboards', actions: ['read', 'update', 'configure', 'analyze'] },
                    { resource: 'kpis', actions: ['read', 'update', 'configure', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['read', 'update', 'assign'] },
                    { resource: 'roles', actions: ['read'] },
                    { resource: 'integrations', actions: ['read', 'update', 'configure'] },
                    { resource: 'settings', actions: ['read', 'update', 'configure'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update', 'dictate'] },
                    { resource: 'documents', actions: ['read', 'update', 'export'] },
                    { resource: 'files', actions: ['read', 'update', 'export'] },
                    { resource: 'dictation', actions: ['read', 'update', 'dictate', 'configure'] }
                ],
                isSystem: true
            },
            {
                name: 'Sales Manager',
                description: 'Team management with oversight of sales operations and team performance',
                category: 'management',
                level: 3,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'leads', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'customers', actions: ['read', 'update', 'export', 'assign'] },
                    { resource: 'referrals', actions: ['read', 'update', 'export', 'assign'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['read', 'update', 'analyze'] },
                    { resource: 'opportunities', actions: ['read', 'update', 'approve', 'assign'] },
                    { resource: 'deals', actions: ['read', 'update', 'approve', 'assign'] },
                    { resource: 'campaigns', actions: ['read', 'update', 'configure'] },
                    // Communication
                    { resource: 'emails', actions: ['read', 'update', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['read', 'update', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['read', 'update', 'configure'] },
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['read', 'update', 'schedule', 'approve'] },
                    { resource: 'meetings', actions: ['read', 'update', 'schedule', 'approve'] },
                    { resource: 'reminders', actions: ['read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update', 'assign', 'approve'] },
                    { resource: 'workflows', actions: ['read', 'update', 'configure'] },
                    { resource: 'boards', actions: ['read', 'update', 'configure', 'assign'] },
                    { resource: 'automations', actions: ['read', 'update', 'configure'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'update', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'update', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'update', 'configure', 'analyze'] },
                    { resource: 'kpis', actions: ['read', 'update', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['read', 'update', 'assign'] },
                    { resource: 'integrations', actions: ['read', 'update'] },
                    { resource: 'settings', actions: ['read', 'update'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update', 'dictate'] },
                    { resource: 'documents', actions: ['read', 'update', 'export'] },
                    { resource: 'files', actions: ['read', 'update', 'export'] },
                    { resource: 'dictation', actions: ['read', 'update', 'dictate'] }
                ],
                isSystem: true
            },
            {
                name: 'Senior Sales Representative',
                description: 'Experienced sales professional with advanced CRM and AI features access',
                category: 'sales',
                level: 3,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['create', 'read', 'update', 'export', 'assign'] },
                    { resource: 'leads', actions: ['create', 'read', 'update', 'export', 'assign'] },
                    { resource: 'customers', actions: ['create', 'read', 'update', 'export', 'assign'] },
                    { resource: 'referrals', actions: ['create', 'read', 'update', 'export', 'assign'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['read', 'update', 'analyze'] },
                    { resource: 'opportunities', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'deals', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'campaigns', actions: ['read', 'update'] },
                    // Communication
                    { resource: 'emails', actions: ['create', 'read', 'update', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['create', 'read', 'update', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['read', 'update'] },
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'meetings', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'workflows', actions: ['read', 'update'] },
                    { resource: 'boards', actions: ['read', 'update', 'assign'] },
                    { resource: 'automations', actions: ['read', 'update'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'analyze'] },
                    { resource: 'kpis', actions: ['read', 'analyze'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'dictate'] },
                    { resource: 'documents', actions: ['create', 'read', 'update', 'export'] },
                    { resource: 'files', actions: ['create', 'read', 'update', 'export'] },
                    { resource: 'dictation', actions: ['read', 'update', 'dictate'] }
                ],
                isSystem: true
            },
            {
                name: 'Sales Representative',
                description: 'Standard sales professional with core CRM and AI features',
                category: 'sales',
                level: 2,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'leads', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'customers', actions: ['create', 'read', 'update', 'assign'] },
                    { resource: 'referrals', actions: ['create', 'read', 'update', 'assign'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['read', 'update'] },
                    { resource: 'opportunities', actions: ['create', 'read', 'update'] },
                    { resource: 'deals', actions: ['create', 'read', 'update'] },
                    { resource: 'campaigns', actions: ['read'] },
                    // Communication
                    { resource: 'emails', actions: ['create', 'read', 'update', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['create', 'read', 'update', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['read'] },
                    { resource: 'ai_generator', actions: ['read', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'meetings', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update'] },
                    { resource: 'workflows', actions: ['read'] },
                    { resource: 'boards', actions: ['read', 'update'] },
                    { resource: 'automations', actions: ['read'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    { resource: 'kpis', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'dictate'] },
                    { resource: 'documents', actions: ['create', 'read', 'update'] },
                    { resource: 'files', actions: ['create', 'read', 'update'] },
                    { resource: 'dictation', actions: ['read', 'dictate'] }
                ],
                isSystem: true
            },
            {
                name: 'Junior Sales Representative',
                description: 'Entry-level sales professional with basic CRM access',
                category: 'sales',
                level: 1,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['read', 'update'] },
                    { resource: 'leads', actions: ['read', 'update'] },
                    { resource: 'customers', actions: ['read', 'update'] },
                    { resource: 'referrals', actions: ['read', 'update'] },
                    // Sales & Pipeline
                    { resource: 'pipeline', actions: ['read'] },
                    { resource: 'opportunities', actions: ['read', 'update'] },
                    { resource: 'deals', actions: ['read', 'update'] },
                    { resource: 'campaigns', actions: ['read'] },
                    // Communication
                    { resource: 'emails', actions: ['read', 'send', 'generate'] },
                    { resource: 'communications', actions: ['read', 'send'] },
                    { resource: 'templates', actions: ['read'] },
                    { resource: 'ai_generator', actions: ['read', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read'] },
                    { resource: 'appointments', actions: ['read', 'schedule'] },
                    { resource: 'meetings', actions: ['read', 'schedule'] },
                    { resource: 'reminders', actions: ['read'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update'] },
                    { resource: 'workflows', actions: ['read'] },
                    { resource: 'boards', actions: ['read'] },
                    { resource: 'automations', actions: ['read'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    { resource: 'kpis', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'documents', actions: ['read'] },
                    { resource: 'files', actions: ['read'] },
                    { resource: 'dictation', actions: ['read'] }
                ],
                isSystem: true
            },
            {
                name: 'Marketing Specialist',
                description: 'Marketing professional with campaign and communication access',
                category: 'support',
                level: 2,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['read', 'export'] },
                    { resource: 'leads', actions: ['read', 'export'] },
                    { resource: 'customers', actions: ['read', 'export'] },
                    { resource: 'referrals', actions: ['read', 'export'] },
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['create', 'read', 'update', 'configure'] },
                    // Communication
                    { resource: 'emails', actions: ['create', 'read', 'update', 'send', 'schedule', 'generate'] },
                    { resource: 'communications', actions: ['create', 'read', 'update', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['create', 'read', 'update', 'configure'] },
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate', 'configure'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'analyze'] },
                    { resource: 'kpis', actions: ['read', 'analyze'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'documents', actions: ['read', 'update'] },
                    { resource: 'files', actions: ['read', 'update'] }
                ],
                isSystem: true
            },
            {
                name: 'Customer Success Manager',
                description: 'Customer success professional with customer relationship access',
                category: 'support',
                level: 2,
                permissions: [
                    // Core CRM Resources
                    { resource: 'contacts', actions: ['read', 'update'] },
                    { resource: 'customers', actions: ['read', 'update'] },
                    { resource: 'referrals', actions: ['read', 'update'] },
                    // Communication
                    { resource: 'emails', actions: ['read', 'send', 'schedule'] },
                    { resource: 'communications', actions: ['read', 'send', 'schedule'] },
                    { resource: 'templates', actions: ['read'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'schedule'] },
                    { resource: 'appointments', actions: ['read', 'schedule'] },
                    { resource: 'meetings', actions: ['read', 'schedule'] },
                    { resource: 'reminders', actions: ['read', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update'] },
                    { resource: 'boards', actions: ['read'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'documents', actions: ['read', 'update'] },
                    { resource: 'files', actions: ['read', 'update'] }
                ],
                isSystem: true
            }
        ];

        // Insert roles
        const createdRoles = await Role.insertMany(defaultRoles);
        console.log('Default roles created successfully');

        // Create super admin user if no users exist
        const existingUsers = await User.countDocuments();
        if (existingUsers === 0) {
            const superAdminRole = createdRoles.find(role => role.name === 'Super Admin');
            
            const superAdminUser = new User({
                name: 'Super Admin',
                email: 'admin@melnitz.com',
                password: await hashPassword('admin123'),
                phone: '1234567890',
                address: 'System Address',
                answer: 'admin',
                role: superAdminRole._id,
                isSuperAdmin: true
            });

            await superAdminUser.save();
            console.log('Super admin user created successfully');
        }

    } catch (error) {
        console.error('Error seeding roles:', error);
    }
};
