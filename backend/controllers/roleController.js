import Role from "../models/roleModel.js";

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({}).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "Roles fetched successfully",
            roles,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching roles",
            error: error.message,
        });
    }
};

// Get single role by ID
export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Role fetched successfully",
            role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching role",
            error: error.message,
        });
    }
};

// Create new role
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Validations
        if (!name) return res.status(400).send({ success: false, message: "Role name is required" });
        if (!description) return res.status(400).send({ success: false, message: "Role description is required" });
        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).send({ success: false, message: "Permissions array is required" });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).send({
                success: false,
                message: "Role with this name already exists",
            });
        }

        // Validate permissions structure
        for (const permission of permissions) {
            if (!permission.resource || !permission.actions || !Array.isArray(permission.actions)) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid permission structure. Each permission must have 'resource' and 'actions' array",
                });
            }
        }

        // Create role
        const role = await new Role({
            name,
            description,
            permissions
        }).save();

        res.status(201).send({
            success: true,
            message: "Role created successfully",
            role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error creating role",
            error: error.message,
        });
    }
};

// Update role
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        // Check if role exists
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found",
            });
        }

        // Prevent updating Super Admin role
        if (role.name === 'Super Admin') {
            return res.status(400).send({
                success: false,
                message: "Cannot modify Super Admin role",
            });
        }

        // Check if new name already exists (if being changed)
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).send({
                    success: false,
                    message: "Role with this name already exists",
                });
            }
        }

        // Validate permissions structure if provided
        if (permissions) {
            if (!Array.isArray(permissions)) {
                return res.status(400).send({
                    success: false,
                    message: "Permissions must be an array",
                });
            }

            for (const permission of permissions) {
                if (!permission.resource || !permission.actions || !Array.isArray(permission.actions)) {
                    return res.status(400).send({
                        success: false,
                        message: "Invalid permission structure. Each permission must have 'resource' and 'actions' array",
                    });
                }
            }
        }

        // Update role
        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                name: name || role.name,
                description: description || role.description,
                permissions: permissions || role.permissions,
            },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: "Role updated successfully",
            role: updatedRole,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error updating role",
            error: error.message,
        });
    }
};

// Delete role
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if role exists
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found",
            });
        }

        // Prevent deleting Super Admin role
        if (role.name === 'Super Admin') {
            return res.status(400).send({
                success: false,
                message: "Cannot delete Super Admin role",
            });
        }

        // Check if any users are using this role
        const auth = (await import('../models/authModel.js')).default;
        const usersWithRole = await auth.find({ role: id });
        if (usersWithRole.length > 0) {
            return res.status(400).send({
                success: false,
                message: `Cannot delete role. ${usersWithRole.length} user(s) are currently assigned to this role.`,
            });
        }

        // Delete role
        await Role.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "Role deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error deleting role",
            error: error.message,
        });
    }
};

// Get role statistics
export const getRoleStats = async (req, res) => {
    try {
        const totalRoles = await Role.countDocuments();
        
        const rolesWithUserCount = await Role.aggregate([
            {
                $lookup: {
                    from: 'auths',
                    localField: '_id',
                    foreignField: 'role',
                    as: 'users'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    userCount: { $size: '$users' },
                    permissions: 1
                }
            }
        ]);

        res.status(200).send({
            success: true,
            message: "Role statistics fetched successfully",
            stats: {
                totalRoles,
                rolesWithUserCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching role statistics",
            error: error.message,
        });
    }
};

// Get available resources and actions for role creation
export const getAvailablePermissions = async (req, res) => {
    try {
        const availableResources = [
            'contacts',
            'tasks',
            'campaigns',
            'ai_generator',
            'dashboards',
            'reports',
            'analytics',
            'users',
            'roles',
            'settings',
            'tickets'
        ];

        const availableActions = [
            'create',
            'read',
            'update',
            'delete',
            'export',
            'import',
            'assign',
            'send',
            'generate',
            'analyze',
            'configure'
        ];

        res.status(200).send({
            success: true,
            message: "Available permissions fetched successfully",
            permissions: {
                resources: availableResources,
                actions: availableActions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching available permissions",
            error: error.message,
        });
    }
};