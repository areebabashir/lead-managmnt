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
  getContactsForEmail
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

export default router;





