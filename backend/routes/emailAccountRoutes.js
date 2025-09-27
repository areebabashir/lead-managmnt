import express from 'express';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { hasPermission } from '../Middlewares/hasPermissionMiddleware.js';
import { 
    getEmailAccounts, 
    createEmailAccount, 
    updateEmailAccount, 
    deleteEmailAccount,
    getActiveEmailAccount,
    activateEmailAccount
} from '../controllers/emailAccountController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Get all email accounts for company
router.get('/', getEmailAccounts);

// Get active email account
router.get('/active', getActiveEmailAccount);

// Create new email account
router.post('/', hasPermission('settings', 'create'), createEmailAccount);

// Update email account
router.put('/:id', hasPermission('settings', 'update'), updateEmailAccount);

// Activate email account
router.patch('/:id/activate', hasPermission('settings', 'update'), activateEmailAccount);

// Delete email account
router.delete('/:id', hasPermission('settings', 'delete'), deleteEmailAccount);

export default router;
