import express from 'express';
import {
  generateAndSaveEmail,
  sendEmailNow,
  scheduleEmail,
  saveEmailDraft,
  getUserEmails,
  getEmailById,
  cancelScheduledEmail,
  deleteEmail,
  getEmailStats,
  getContactsForEmail,
  // Inbox functionality
  getInboxEmails,
  getEmailThread,
  markEmailAsRead,
  toggleEmailStar,
  syncInboxEmails
} from '../controllers/emailController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Email Generation and Management
router.post('/generate', generateAndSaveEmail);
router.get('/contacts', getContactsForEmail);

// Email Actions
router.post('/:emailId/send', sendEmailNow);
router.post('/:emailId/schedule', scheduleEmail);
router.put('/:emailId/draft', saveEmailDraft);
router.delete('/:emailId/cancel', cancelScheduledEmail);
router.delete('/:emailId', deleteEmail);

// Email Retrieval
router.get('/', getUserEmails);
router.get('/stats', getEmailStats);
router.get('/:emailId', getEmailById);

// ==================== INBOX ROUTES ====================
// Inbox functionality
router.get('/inbox/list', getInboxEmails);
router.get('/thread/:threadId', getEmailThread);
router.post('/inbox/sync', syncInboxEmails);
router.put('/:emailId/read', markEmailAsRead);
router.put('/:emailId/star', toggleEmailStar);

export default router;





