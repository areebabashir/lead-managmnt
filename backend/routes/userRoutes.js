import express from "express";
import { requireSignIn } from "../Middlewares/authMiddlewares.js";
import { hasPermission, requireSuperAdmin } from "../Middlewares/hasPermissionMiddleware.js";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    getUserStats,
    getUserPermissions
} from "../controllers/userController.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/", requireSignIn, hasPermission('users', 'read'), getAllUsers);

// Get user statistics (Admin only)
router.get("/stats", requireSignIn, hasPermission('users', 'read'), getUserStats);

// Get user permissions (Admin only)
router.get("/:id/permissions", requireSignIn, hasPermission('users', 'read'), getUserPermissions);

// Get single user by ID (Admin only)
router.get("/:id", requireSignIn, hasPermission('users', 'read'), getUserById);

// Create new user (Super Admin only)
router.post("/", requireSignIn, requireSuperAdmin, createUser);

// Update user (Super Admin only)
router.put("/:id", requireSignIn, requireSuperAdmin, updateUser);

// Delete user (Super Admin only)
router.delete("/:id", requireSignIn, requireSuperAdmin, deleteUser);

// Assign role to user (Super Admin only)
router.post("/assign-role", requireSignIn, requireSuperAdmin, assignRole);

export default router;