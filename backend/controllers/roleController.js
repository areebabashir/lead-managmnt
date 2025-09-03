import Role from '../models/roleModel.js';
import User from '../models/authModel.js';
import UserPermission from '../models/userPermissionModel.js';

// Create a new role
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: "Role with this name already exists"
            });
        }

        const role = new Role({
            name,
            description,
            permissions: permissions || []
        });

        await role.save();

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating role",
            error: error.message
        });
    }
};

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isActive: true }).populate('permissions');
        
        res.status(200).json({
            success: true,
            roles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching roles",
            error: error.message
        });
    }
};

// Get role by ID
export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id).populate('permissions');
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        res.status(200).json({
            success: true,
            role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching role",
            error: error.message
        });
    }
};

// Update role
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions, isActive } = req.body;

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Prevent updating system roles
        if (role.isSystem) {
            return res.status(400).json({
                success: false,
                message: "System roles cannot be modified"
            });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            { name, description, permissions, isActive },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            role: updatedRole
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating role",
            error: error.message
        });
    }
};

// Delete role
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Prevent deleting system roles
        if (role.isSystem) {
            return res.status(400).json({
                success: false,
                message: "System roles cannot be deleted"
            });
        }

        // Check if any users are using this role
        const usersWithRole = await User.find({ role: id });
        if (usersWithRole.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete role. Users are currently assigned to it."
            });
        }

        await Role.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting role",
            error: error.message
        });
    }
};

// Assign custom permissions to user
export const assignCustomPermissions = async (req, res) => {
    try {
        const { userId, resource, actions, expiresAt } = req.body;
        const grantedBy = req.user._id;

        if (!userId || !resource || !actions || !Array.isArray(actions)) {
            return res.status(400).json({
                success: false,
                message: "userId, resource, and actions array are required"
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Create or update user permission
        const userPermission = await UserPermission.findOneAndUpdate(
            { userId, resource },
            {
                actions,
                grantedBy,
                expiresAt: expiresAt || null,
                isActive: true
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Custom permissions assigned successfully",
            userPermission
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error assigning custom permissions",
            error: error.message
        });
    }
};

// Remove custom permissions from user
export const removeCustomPermissions = async (req, res) => {
    try {
        const { userId, resource } = req.params;

        const userPermission = await UserPermission.findOneAndDelete({
            userId,
            resource
        });

        if (!userPermission) {
            return res.status(404).json({
                success: false,
                message: "Custom permission not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Custom permissions removed successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error removing custom permissions",
            error: error.message
        });
    }
};

// Get user permissions (role + custom)
export const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('role');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get custom permissions
        const customPermissions = await UserPermission.find({
            userId,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin
            },
            rolePermissions: user.role?.permissions || [],
            customPermissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching user permissions",
            error: error.message
        });
    }
};
