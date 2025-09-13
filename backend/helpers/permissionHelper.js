import User from '../models/authModel.js';
// import UserPermission from '../models/userPermissionModel.js';
import Permission from '../models/permissionModel.js';

// Check if user has permission for a specific resource and action
export const hasPermission = async (userId, resource, action) => {
    try {
        const user = await User.findById(userId)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });
        
        if (!user) {
            return false;
        }

        // Super admin has all permissions
        if (user.isSuperAdmin) {
            return true;
        }

        // Check role permissions
        if (user.role && user.role.permissions) {
            const hasRolePermission = user.role.permissions.some(permission => 
                permission.resource === resource && permission.action === action
            );
            if (hasRolePermission) {
                return true;
            }
        }

        // Check custom permissions
        const customPermission = await Permission.findOne({
            userId,
            resource,
            actions: action,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        return !!customPermission;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

// Check if user has access to a resource (any permission)
export const hasResourceAccess = async (userId, resource) => {
    try {
        const user = await User.findById(userId)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });
        
        if (!user) {
            return false;
        }

        // Super admin has all access
        if (user.isSuperAdmin) {
            return true;
        }

        // Check role permissions
        if (user.role && user.role.permissions) {
            const hasAccess = user.role.permissions.some(permission => 
                permission.resource === resource
            );
            if (hasAccess) {
                return true;
            }
        }

        // Check custom permissions
        const customPermission = await Permission.findOne({
            userId,
            resource,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        return !!customPermission;
    } catch (error) {
        console.error('Error checking resource access:', error);
        return false;
    }
};

// Get all permissions for a user
export const getUserAllPermissions = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });
        
        if (!user) {
            return { rolePermissions: [], customPermissions: [] };
        }

        // Get custom permissions
        const customPermissions = await Permission.find({
            userId,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        return {
            rolePermissions: user.role?.permissions || [],
            customPermissions,
            isSuperAdmin: user.isSuperAdmin
        };
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return { rolePermissions: [], customPermissions: [] };
    }
};

// Check if user is super admin
export const isSuperAdmin = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user ? user.isSuperAdmin : false;
    } catch (error) {
        console.error('Error checking super admin status:', error);
        return false;
    }
};

// Check if user is admin
export const isAdmin = async (userId) => {
    try {
        const user = await User.findById(userId).populate('role');
        if (!user) return false;
        
        return user.isSuperAdmin || (user.role && user.role.name === 'Admin');
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};
