import Role from "../models/roleModel.js";

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({})
            .populate('permissions')
            .sort({ createdAt: -1 });

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
        const role = await Role.findById(id).populate('permissions');

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

        // Validate that all permission IDs exist
        const Permission = (await import('../models/permissionModel.js')).default;
        const existingPermissions = await Permission.find({ _id: { $in: permissions } });
        
        if (existingPermissions.length !== permissions.length) {
            return res.status(400).send({
                success: false,
                message: "One or more permission IDs are invalid",
            });
        }

        // Create role with permission ObjectIds
        const role = await new Role({
            name,
            description,
            permissions: permissions // Array of Permission ObjectIds
        }).save();

        // Populate permissions for response
        const populatedRole = await Role.findById(role._id).populate('permissions');

        res.status(201).send({
            success: true,
            message: "Role created successfully",
            role: populatedRole,
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

        // Validate permissions if provided
        if (permissions) {
            if (!Array.isArray(permissions)) {
                return res.status(400).send({
                    success: false,
                    message: "Permissions must be an array",
                });
            }

            // Validate that all permission IDs exist
            const Permission = (await import('../models/permissionModel.js')).default;
            const existingPermissions = await Permission.find({ _id: { $in: permissions } });
            
            if (existingPermissions.length !== permissions.length) {
                return res.status(400).send({
                    success: false,
                    message: "One or more permission IDs are invalid",
                });
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
        ).populate('permissions');

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
        // Get all permissions from the database
        const Permission = (await import('../models/permissionModel.js')).default;
        const permissions = await Permission.find({}).sort({ resource: 1, action: 1 });

        // Group permissions by resource for easier frontend handling
        const permissionsByResource = {};
        permissions.forEach(permission => {
            if (!permissionsByResource[permission.resource]) {
                permissionsByResource[permission.resource] = [];
            }
            permissionsByResource[permission.resource].push({
                _id: permission._id,
                action: permission.action
            });
        });

        res.status(200).send({
            success: true,
            message: "Available permissions fetched successfully",
            permissions: permissions,
            permissionsByResource: permissionsByResource
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