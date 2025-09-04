import express from "express";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddlewares.js";
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
router.get("/", requireSignIn, isAdmin, getAllRoles);

// Get available permissions for role creation (Admin only)
router.get("/permissions", requireSignIn, isAdmin, getAvailablePermissions);

// Get role statistics (Admin only)
router.get("/stats", requireSignIn, isAdmin, getRoleStats);

// Get single role by ID (Admin only)
router.get("/:id", requireSignIn, isAdmin, getRoleById);

// Create new role (Admin only)
router.post("/", requireSignIn, isAdmin, createRole);

// Update role (Admin only)
router.put("/:id", requireSignIn, isAdmin, updateRole);

// Delete role (Admin only)
router.delete("/:id", requireSignIn, isAdmin, deleteRole);

export default router;