import User from '../models/authModel.js';
import Permission from '../models/permissionModel.js';

/**
 * Middleware to check if user has specific permission
 * @param {string} resource - The resource to check permission for
 * @param {string} action - The action to check permission for
 * @returns {Function} Express middleware function
 */
export const hasPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Get user with populated role and permissions
            const user = await User.findById(userId)
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions',
                        model: 'Permission'
                    }
                });

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

            // Check if user has the specific permission through their role
            if (user.role && user.role.permissions) {
                const hasRequiredPermission = user.role.permissions.some(permission => 
                    permission.resource === resource && permission.action === action
                );

                if (hasRequiredPermission) {
                    return next();
                }
            }

            // Permission denied
            return res.status(403).json({
                success: false,
                message: `Access denied. You don't have permission to ${action} ${resource}`
            });

        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions"
            });
        }
    };
};

/**
 * Middleware to check if user has any permission for a resource
 * @param {string} resource - The resource to check access for
 * @returns {Function} Express middleware function
 */
export const hasResourceAccess = (resource) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Get user with populated role and permissions
            const user = await User.findById(userId)
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions',
                        model: 'Permission'
                    }
                });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Super admin has all access
            if (user.isSuperAdmin) {
                return next();
            }

            // Check if user has any permission for the resource
            if (user.role && user.role.permissions) {
                const hasAccess = user.role.permissions.some(permission => 
                    permission.resource === resource
                );

                if (hasAccess) {
                    return next();
                }
            }

            // Access denied
            return res.status(403).json({
                success: false,
                message: `Access denied. You don't have access to ${resource}`
            });

        } catch (error) {
            console.error('Resource access check error:', error);
            return res.status(500).json({
                success: false,
                message: "Error checking resource access"
            });
        }
    };
};

/**
 * Middleware to check if user is super admin
 * @returns {Function} Express middleware function
 */
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

/**
 * Middleware to check if user is admin or super admin
 * @returns {Function} Express middleware function
 */
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
