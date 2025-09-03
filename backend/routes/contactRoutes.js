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

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Contact CRUD operations
router.post('/create', createContact);
router.get('/', getContacts);
router.get('/:id', getContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

// Contact notes and status
router.post('/:id/notes', addNote);
router.put('/:id/status', updateStatus);

// Contact queries and filters
router.get('/status/:status', getContactsByStatus);
router.get('/follow-up/needed', getContactsNeedingFollowUp);
router.get('/referrals/all', getReferralContacts);

// Import and export
router.post('/import', importContacts);
router.get('/export', exportContacts);

export default router;
