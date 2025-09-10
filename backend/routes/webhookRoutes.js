import express from 'express';
import { 
    receiveFacebookLead, 
    receiveZapierLead, 
    testWebhook 
} from '../controllers/webhookController.js';

const router = express.Router();

// Test endpoint to verify webhook is working
router.post('/test', testWebhook);

// Facebook Lead Ads webhook (via Zapier)
router.post('/facebook-lead', receiveFacebookLead);

// General Zapier webhook for any lead source
router.post('/zapier-lead', receiveZapierLead);

export default router;
