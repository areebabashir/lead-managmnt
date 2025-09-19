import express from 'express';
import { 
    sendSMS, 
    sendBulkSMS, 
    getSMSHistory, 
    getSMSStats, 
    handleTwilioWebhook,
    getConversation 
} from '../controllers/smsController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// All routes except webhook require authentication
router.use((req, res, next) => {
    // Skip auth for Twilio webhook
    if (req.path === '/webhook') {
        return next();
    }
    return requireSignIn(req, res, next);
});

// Send SMS to single recipient
router.post('/send', sendSMS);

// Send SMS to multiple recipients
router.post('/send-bulk', sendBulkSMS);

// Get SMS history for current user
router.get('/history', getSMSHistory);

// Get SMS statistics for current user
router.get('/stats', getSMSStats);

// Get conversation with specific contact
router.get('/conversation/:recipientType/:recipientId', getConversation);

// Twilio webhook for status updates (no auth required)
router.post('/webhook', handleTwilioWebhook);

export default router;

