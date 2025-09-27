
import Role from '../models/roleModel.js';
import Permission from '../models/permissionModel.js';
import User from '../models/authModel.js';
import { hashPassword } from '../helpers/authHelper.js';

// Helper function to create or get permission
const createOrGetPermission = async (resource, action) => {
    let permission = await Permission.findOne({ resource, action });
    if (!permission) {
        permission = new Permission({ resource, action });
        await permission.save();
    }
    return permission._id;
};

// Helper function to create permissions for a role
const createRolePermissions = async (permissionList) => {
    const permissionIds = [];
    for (const perm of permissionList) {
        for (const action of perm.actions) {
            const permissionId = await createOrGetPermission(perm.resource, action);
            permissionIds.push(permissionId);
        }
    }
    return permissionIds;
};

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
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'configure'] },
                    // Communication
                    { resource: 'ai_generator', actions: ['create', 'read', 'update', 'delete', 'generate', 'configure'] },
                    { resource: 'email', actions: ['create', 'read', 'update', 'delete', 'send', 'schedule', 'manage', 'sync', 'star', 'cancel', 'edit', 'view'] },
                    { resource: 'sms', actions: ['create', 'read', 'update', 'delete', 'send', 'schedule', 'manage'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete', 'schedule', 'integrate'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete', 'schedule', 'approve'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'delete', 'schedule', 'configure'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign', 'approve', 'reject'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'analyze', 'configure'] },
                    { resource: 'dashboards', actions: ['create', 'read', 'update', 'delete', 'configure', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'permissions', actions: ['create', 'read', 'update', 'delete', 'assign', 'export'] },
                    { resource: 'settings', actions: ['create', 'read', 'update', 'delete', 'configure'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'delete', 'dictate'] },
                    { resource: 'meeting_notes', actions: ['create', 'read', 'update', 'delete', 'transcribe', 'summarize'] },
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
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['read', 'update', 'approve', 'reject', 'configure'] },
                    // Communication
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate', 'configure'] },
                    { resource: 'email', actions: ['read', 'update', 'send', 'schedule', 'manage', 'sync', 'star', 'cancel', 'edit', 'view'] },
                    { resource: 'sms', actions: ['read', 'update', 'send', 'schedule', 'manage'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule', 'integrate'] },
                    { resource: 'appointments', actions: ['read', 'update', 'schedule', 'approve'] },
                    { resource: 'reminders', actions: ['read', 'update', 'schedule', 'configure'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update', 'assign', 'approve', 'reject'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'update', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'update', 'analyze', 'configure'] },
                    { resource: 'dashboards', actions: ['read', 'update', 'configure', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['read', 'update', 'assign'] },
                    { resource: 'roles', actions: ['read'] },
                    { resource: 'settings', actions: ['read', 'update', 'configure'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update', 'dictate'] },
                    { resource: 'meeting_notes', actions: ['read', 'update', 'transcribe', 'summarize'] },
                ],
                isSystem: false
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
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['read', 'update', 'configure'] },
                    // Communication
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate'] },
                    { resource: 'email', actions: ['read', 'update', 'send', 'schedule', 'manage', 'edit', 'view'] },
                    { resource: 'sms', actions: ['read', 'update', 'send', 'schedule', 'manage'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['read', 'update', 'schedule', 'approve'] },
                
                    { resource: 'reminders', actions: ['read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update', 'assign', 'approve'] },

                    { resource: 'reports', actions: ['read', 'update', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'update', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'update', 'configure', 'analyze'] },
                    // System & Admin
                    { resource: 'users', actions: ['read', 'update', 'assign'] },
                    { resource: 'settings', actions: ['read', 'update'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update', 'dictate'] },

                ],
                isSystem: false
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
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['read', 'update'] },
                    // Communication
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update', 'assign'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'analyze'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'dictate'] },
                    { resource: 'meeting_notes', actions: ['create', 'read', 'update', 'transcribe', 'summarize'] },
                ],
                isSystem: false
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
                    // Sales & Pipeline
                    { resource: 'campaigns', actions: ['read'] },
                    // Communication
                    { resource: 'ai_generator', actions: ['read', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'update', 'schedule'] },
                    { resource: 'appointments', actions: ['create', 'read', 'update', 'schedule'] },
                    { resource: 'reminders', actions: ['create', 'read', 'update', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['create', 'read', 'update'] },

                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['create', 'read', 'update', 'dictate'] },
                    { resource: 'meeting_notes', actions: ['create', 'read', 'update', 'transcribe', 'summarize'] },

                ],
                isSystem: false
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
                    // Sales & Pipeline

                    { resource: 'campaigns', actions: ['read'] },
                    // Communication

                    { resource: 'ai_generator', actions: ['read', 'generate'] },
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read'] },
                    { resource: 'appointments', actions: ['read', 'schedule'] },
                    { resource: 'reminders', actions: ['read'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update'] },
 
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'meeting_notes', actions: ['read'] },

                ],
                isSystem: false
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
                    // Sales & Pipeline

                    // Communication
    
                    { resource: 'ai_generator', actions: ['read', 'update', 'generate', 'configure'] },
                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read', 'export', 'analyze'] },
                    { resource: 'analytics', actions: ['read', 'analyze'] },
                    { resource: 'dashboards', actions: ['read', 'analyze'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'meeting_notes', actions: ['read'] },

                ],
                isSystem: false
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
                    // Communication
    
                    // Calendar & Scheduling
                    { resource: 'calendar', actions: ['read', 'schedule'] },
                    { resource: 'appointments', actions: ['read', 'schedule'] },

                    { resource: 'reminders', actions: ['read', 'schedule'] },
                    // Task & Workflow
                    { resource: 'tasks', actions: ['read', 'update'] },

                    // Analytics & Reporting
                    { resource: 'reports', actions: ['read'] },
                    { resource: 'analytics', actions: ['read'] },
                    { resource: 'dashboards', actions: ['read'] },
                    // Notes & Documents
                    { resource: 'notes', actions: ['read', 'update'] },
                    { resource: 'meeting_notes', actions: ['read'] },

                ],
                isSystem: false
            }
        ];

        // Create roles with permission references
        const createdRoles = [];
        for (const roleData of defaultRoles) {
            const { permissions, ...roleInfo } = roleData;
            const permissionIds = await createRolePermissions(permissions);
            
            const role = new Role({
                ...roleInfo,
                permissions: permissionIds
            });
            
            await role.save();
            createdRoles.push(role);
        }
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
