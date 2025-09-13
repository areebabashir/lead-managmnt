import express from "express";
import { requireSignIn } from "../Middlewares/authMiddlewares.js";
import { hasPermission, requireSuperAdmin } from "../Middlewares/hasPermissionMiddleware.js";
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getRoleStats,
    getAvailablePermissions
} from "../controllers/roleController.js";

const router = express.Router();

// Get all roles (Admin only)
router.get("/", requireSignIn, hasPermission('roles', 'read'), getAllRoles);

// Get available permissions for role creation (Admin only)
router.get("/permissions", requireSignIn, hasPermission('roles', 'read'), getAvailablePermissions);

// Get role statistics (Admin only)
router.get("/stats", requireSignIn, hasPermission('roles', 'read'), getRoleStats);

// Get single role by ID (Admin only)
router.get("/:id", requireSignIn, hasPermission('roles', 'read'), getRoleById);

// Create new role (Super Admin only)
router.post("/", requireSignIn, requireSuperAdmin, createRole);

// Update role (Super Admin only)
router.put("/:id", requireSignIn, requireSuperAdmin, updateRole);

// Delete role (Super Admin only)
router.delete("/:id", requireSignIn, requireSuperAdmin, deleteRole);

export default router;