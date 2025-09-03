import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRoleToUser,
    toggleSuperAdmin
} from '../controllers/userController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { requireSuperAdmin, requireAdmin } from '../Middlewares/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// User management routes (Super Admin only)
router.post('/create', requireSuperAdmin, createUser);
router.put('/:id', requireSuperAdmin, updateUser);
router.delete('/:id', requireSuperAdmin, deleteUser);
router.post('/assign-role', requireSuperAdmin, assignRoleToUser);
router.put('/:userId/toggle-super-admin', requireSuperAdmin, toggleSuperAdmin);

// User viewing routes (Admin and Super Admin)
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);

export default router;
