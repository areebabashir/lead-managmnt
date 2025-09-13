import auth from "../models/authModel.js";
import Role from "../models/roleModel.js";
// import UserPermission from "../models/userPermissionModel.js";
import Permission from "../models/permissionModel.js";
import { hashPassword } from "../helpers/authHelper.js";

// Get all users with their roles
export const getAllUsers = async (req, res) => {
    try {
        const users = await auth.find({})
            .populate('role', 'name description')
            .select('-password -answer')
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
};

// Get single user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await auth.findById(id)
            .populate('role', 'name description permissions')
            .select('-password -answer');

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching user",
            error: error.message,
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, roleId } = req.body;

        // Validations
        if (!name) return res.status(400).send({ success: false, message: "Name is required" });
        if (!email) return res.status(400).send({ success: false, message: "Email is required" });
        if (!password) return res.status(400).send({ success: false, message: "Password is required" });
        if (!phone) return res.status(400).send({ success: false, message: "Phone is required" });
        if (!address) return res.status(400).send({ success: false, message: "Address is required" });
        // Role is optional - users can be created without a role

        // Check if user already exists
        const existingUser = await auth.findOne({ email });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Check if role exists (if provided)
        if (roleId) {
            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid role selected",
                });
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await new auth({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: roleId || null,
            answer: "default" // Default security answer
        }).save();

        // Populate role for response
        await user.populate('role', 'name description');

        res.status(201).send({
            success: true,
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error creating user",
            error: error.message,
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, roleId, password } = req.body;

        // Check if user exists
        const user = await auth.findById(id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await auth.findOne({ email });
            if (existingUser) {
                return res.status(400).send({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Check if role exists (if being updated)
        if (roleId) {
            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid role selected",
                });
            }
        }

        // Hash new password if provided
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await hashPassword(password);
        }

        // Update user
        const updatedUser = await auth.findByIdAndUpdate(
            id,
            {
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone,
                address: address || user.address,
                role: roleId || user.role,
                password: hashedPassword,
            },
            { new: true }
        ).populate('role', 'name description');

        res.status(200).send({
            success: true,
            message: "User updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                updatedAt: updatedUser.updatedAt
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error updating user",
            error: error.message,
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await auth.findById(id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Prevent deleting Super Admin
        if (user.email === 'admin@melnitz.com') {
            return res.status(400).send({
                success: false,
                message: "Cannot delete Super Admin user",
            });
        }

        // Delete user
        await auth.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
};

// Assign role to user
export const assignRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        // Validations
        if (!userId) return res.status(400).send({ success: false, message: "User ID is required" });
        if (!roleId) return res.status(400).send({ success: false, message: "Role ID is required" });

        // Check if user exists
        const user = await auth.findById(userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).send({
                success: false,
                message: "Role not found",
            });
        }

        // Update user role
        const updatedUser = await auth.findByIdAndUpdate(
            userId,
            { role: roleId },
            { new: true }
        ).populate('role', 'name description');

        res.status(200).send({
            success: true,
            message: "Role assigned successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error assigning role",
            error: error.message,
        });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await auth.countDocuments();
        const usersByRole = await auth.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo'
                }
            },
            {
                $unwind: '$roleInfo'
            },
            {
                $group: {
                    _id: '$roleInfo.name',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentUsers = await auth.find({})
            .populate('role', 'name')
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).send({
            success: true,
            message: "User statistics fetched successfully",
            stats: {
                totalUsers,
                usersByRole,
                recentUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching user statistics",
            error: error.message,
        });
    }
};

// Get user permissions (role permissions + custom permissions)
export const getUserPermissions = async (req, res) => {
    // console.log("getUserPermissions")
    try {
        const { id } = req.params;
        
        // Get user with populated role and permissions
        const user = await auth.findById(id)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            })
            .select('-password -answer');

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Get custom permissions for the user
        const customPermissions = await Permission.find({
            userId: id,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });
        console.log(user.role?.permissions)
        res.status(200).send({
            success: true,
            message: "User permissions fetched successfully",
            permissions: {
                rolePermissions: user.role?.permissions || [],
                customPermissions,
                isSuperAdmin: user.isSuperAdmin
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching user permissions",
            error: error.message,
        });
    }
};