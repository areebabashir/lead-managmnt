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
router.post('/meeting-notes', summarizeMeetingNotes);
router.post('/custom-prompt', processCustomPrompt);
router.post('/suggest-followup', suggestFollowUpTime);
router.post('/process-dictation', processDictation);

// Analytics and History
router.get('/analytics', getAssistantAnalytics);
router.get('/interactions', getInteractionHistory);
router.get('/stats', getAssistantAnalytics);
router.get('/info', getAssistantAnalytics);

// Additional routes for frontend compatibility
router.get('/templates', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/templates', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

router.get('/suggestions', (req, res) => {
  res.json({ success: true, data: [] });
});

// Settings and Management
router.put('/settings', updateAssistantSettings);
router.delete('/clear-cache', clearExpiredCache);

export default router;
