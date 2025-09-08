import express from 'express';
import {
    createContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact,
    addNote,
    updateStatus,
    getContactsByStatus,
    getContactsNeedingFollowUp,
    getReferralContacts,
    importContacts,
    exportContacts
} from '../controllers/contactController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { hasPermission, hasResourceAccess } from '../Middlewares/hasPermissionMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Contact CRUD operations
router.post('/create', hasPermission('contacts', 'create'), createContact);
router.get('/', hasResourceAccess('contacts'), getContacts);
router.get('/:id', hasResourceAccess('contacts'), getContact);
router.put('/:id', hasPermission('contacts', 'update'), updateContact);
router.delete('/:id', hasPermission('contacts', 'delete'), deleteContact);

// Contact notes and status
router.post('/:id/notes', hasPermission('contacts', 'update'), addNote);
router.put('/:id/status', hasPermission('contacts', 'update'), updateStatus);

// Contact queries and filters
router.get('/status/:status', hasResourceAccess('contacts'), getContactsByStatus);
router.get('/follow-up/needed', hasResourceAccess('contacts'), getContactsNeedingFollowUp);
router.get('/referrals/all', hasResourceAccess('contacts'), getReferralContacts);

// Import and export
router.post('/import', hasPermission('contacts', 'import'), importContacts);
router.get('/export', hasPermission('contacts', 'export'), exportContacts);

export default router;
