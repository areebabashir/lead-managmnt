import User from '../models/authModel.js';
import UserPermission from '../models/userPermissionModel.js';

// Check if user has permission for a specific resource and action
export const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Get user with role
            const user = await User.findById(userId).populate('role');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Super admin has all permissions
            if (user.isSuperAdmin) {
                return next();
            }

            // Check role permissions
            let hasPermission = false;
            if (user.role && user.role.permissions) {
                const rolePermission = user.role.permissions.find(
                    p => p.resource === resource && p.actions.includes(action)
                );
                if (rolePermission) {
                    hasPermission = true;
                }
            }

            // Check custom permissions if role permission not found
            if (!hasPermission) {
                const customPermission = await UserPermission.findOne({
                    userId,
                    resource,
                    actions: action,
                    isActive: true,
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                });

                if (customPermission) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. You don't have permission to ${action} ${resource}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions"
            });
        }
    };
};

// Check if user has any permission for a resource
export const checkResourceAccess = (resource) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Get user with role
            const user = await User.findById(userId).populate('role');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Super admin has all permissions
            if (user.isSuperAdmin) {
                return next();
            }

            // Check role permissions
            let hasAccess = false;
            if (user.role && user.role.permissions) {
                const rolePermission = user.role.permissions.find(
                    p => p.resource === resource
                );
                if (rolePermission) {
                    hasAccess = true;
                }
            }

            // Check custom permissions if role permission not found
            if (!hasAccess) {
                const customPermission = await UserPermission.findOne({
                    userId,
                    resource,
                    isActive: true,
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                });

                if (customPermission) {
                    hasAccess = true;
                }
            }

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. You don't have access to ${resource}`
                });
            }

            next();
        } catch (error) {
            console.error('Resource access check error:', error);
            return res.status(500).json({
                success: false,
                message: "Error checking resource access"
            });
        }
    };
};

// Check if user is super admin
export const requireSuperAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || !user.isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: "Super admin access required"
            });
        }

        next();
    } catch (error) {
        console.error('Super admin check error:', error);
        return res.status(500).json({
            success: false,
            message: "Error checking super admin status"
        });
    }
};

// Check if user is admin or super admin
export const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('role');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is super admin or has admin role
        if (user.isSuperAdmin || (user.role && user.role.name === 'Admin')) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({
            success: false,
            message: "Error checking admin status"
        });
    }
};
