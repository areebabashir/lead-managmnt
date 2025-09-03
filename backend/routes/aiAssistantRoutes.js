import express from 'express';
import {
  initializeAssistant,
  generatePersonalizedEmail,
  suggestFollowUpTime,
  summarizeMeetingNotes,
  processDictation,
  processCustomPrompt,
  getAssistantAnalytics,
  getInteractionHistory,
  updateAssistantSettings,
  clearExpiredCache
} from '../controllers/aiAssistantController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Initialize AI Assistant
router.post('/initialize', initializeAssistant);

// AI Content Generation
router.post('/generate-email', generatePersonalizedEmail);
router.post('/suggest-followup', suggestFollowUpTime);
router.post('/summarize-notes', summarizeMeetingNotes);
router.post('/process-dictation', processDictation);
router.post('/custom-prompt', processCustomPrompt);

// Analytics and History
router.get('/analytics', getAssistantAnalytics);
router.get('/interactions', getInteractionHistory);

// Settings and Management
router.put('/settings', updateAssistantSettings);
router.delete('/clear-cache', clearExpiredCache);

export default router;
