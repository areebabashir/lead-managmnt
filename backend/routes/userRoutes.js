import express from "express";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddlewares.js";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    getUserStats
} from "../controllers/userController.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/", requireSignIn, isAdmin, getAllUsers);

// Get user statistics (Admin only)
router.get("/stats", requireSignIn, isAdmin, getUserStats);

// Get single user by ID (Admin only)
router.get("/:id", requireSignIn, isAdmin, getUserById);

// Create new user (Admin only)
router.post("/", requireSignIn, isAdmin, createUser);

// Update user (Admin only)
router.put("/:id", requireSignIn, isAdmin, updateUser);

// Delete user (Admin only)
router.delete("/:id", requireSignIn, isAdmin, deleteUser);

// Assign role to user (Admin only)
router.post("/assign-role", requireSignIn, isAdmin, assignRole);

export default router;