import User from '../models/authModel.js';
import Role from '../models/roleModel.js';
import { hashPassword } from '../helpers/authHelper.js';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('-password')
            .populate('role', 'name description');

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password')
            .populate('role', 'name description permissions');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer, roleId } = req.body;

        // Validations
        if (!name || !email || !password || !phone || !address || !answer || !roleId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID"
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            answer,
            role: roleId
        });

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, roleId, isActive, isSuperAdmin } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if role exists if roleId is provided
        if (roleId) {
            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID"
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone,
                address: address || user.address,
                role: roleId || user.role,
                isActive: isActive !== undefined ? isActive : user.isActive,
                isSuperAdmin: isSuperAdmin !== undefined ? isSuperAdmin : user.isSuperAdmin
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting super admin
        if (user.isSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: "Super admin cannot be deleted"
            });
        }

        // Soft delete
        await User.findByIdAndUpdate(id, { isActive: false });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

// Assign role to user
export const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        if (!userId || !roleId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Role ID are required"
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

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Update user role
        await User.findByIdAndUpdate(userId, { role: roleId });

        res.status(200).json({
            success: true,
            message: "Role assigned successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error assigning role",
            error: error.message
        });
    }
};

// Toggle super admin status
export const toggleSuperAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Toggle super admin status
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isSuperAdmin: !user.isSuperAdmin },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: `Super admin status ${updatedUser.isSuperAdmin ? 'enabled' : 'disabled'} successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error toggling super admin status",
            error: error.message
        });
    }
};
