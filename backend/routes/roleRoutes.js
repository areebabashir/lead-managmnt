import express from 'express';
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignCustomPermissions,
    removeCustomPermissions,
    getUserPermissions
} from '../controllers/roleController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { requireSuperAdmin, requireAdmin } from '../Middlewares/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Role management routes (Super Admin only)
router.post('/create', requireSuperAdmin, createRole);
router.put('/:id', requireSuperAdmin, updateRole);
router.delete('/:id', requireSuperAdmin, deleteRole);

// Role viewing routes (Admin and Super Admin)
router.get('/', requireAdmin, getAllRoles);
router.get('/:id', requireAdmin, getRoleById);

// Custom permission management (Super Admin only)
router.post('/assign-permissions', requireSuperAdmin, assignCustomPermissions);
router.delete('/permissions/:userId/:resource', requireSuperAdmin, removeCustomPermissions);

// Get user permissions (Admin and Super Admin)
router.get('/user/:userId/permissions', requireAdmin, getUserPermissions);

export default router;
