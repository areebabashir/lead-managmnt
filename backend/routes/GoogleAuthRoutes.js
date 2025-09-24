import express from 'express';
import { startGoogleAuth, handleGoogleCallback, testGoogleConfig } from '../controllers/googleAuthController.js';

const router = express.Router();

router.get('/auth', startGoogleAuth);
router.get('/callback', handleGoogleCallback);
router.get('/test-config', testGoogleConfig);

export default router;
