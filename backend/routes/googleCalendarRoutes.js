import express from 'express';
import googleCalendarService from '../services/googleCalendarService.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import User from '../models/authModel.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Get Google Calendar authorization URL
router.get('/auth-url', async (req, res) => {
    try {
        const authUrl = googleCalendarService.getAuthUrl();
        res.status(200).json({
            success: true,
            authUrl
        });
    } catch (error) {
        console.error('Error getting auth URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get authorization URL',
            error: error.message
        });
    }
});

// Handle Google Calendar OAuth callback
router.post('/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Authorization code is required'
            });
        }

        // Exchange code for tokens
        const tokenResult = await googleCalendarService.getTokens(code);
        
        if (!tokenResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to exchange code for tokens',
                error: tokenResult.error
            });
        }

        // Save tokens to user
        await User.findByIdAndUpdate(req.user._id, {
            googleTokens: tokenResult.tokens
        });

        res.status(200).json({
            success: true,
            message: 'Google Calendar connected successfully'
        });
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect Google Calendar',
            error: error.message
        });
    }
});

// Handle direct OAuth callback from Google (for frontend redirect)
router.get('/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/google-calendar-callback?error=${encodeURIComponent(error)}`);
        }
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/google-calendar-callback?error=no_code`);
        }

        // For direct callback, we need to get the user from session or token
        // This is a simplified version - in production you'd want to store the user ID in the state parameter
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/google-calendar-callback?code=${code}`);
    } catch (error) {
        console.error('Error handling direct OAuth callback:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/google-calendar-callback?error=${encodeURIComponent(error.message)}`);
    }
});

// Check if user has Google Calendar connected
router.get('/status', async (req, res) => {
    try {
        // Check if we have a valid refresh token
        const hasValidCredentials = await googleCalendarService.hasValidCredentials();
        
        res.status(200).json({
            success: true,
            connected: hasValidCredentials
        });
    } catch (error) {
        console.error('Error checking Google Calendar status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check Google Calendar status',
            error: error.message
        });
    }
});

// Disconnect Google Calendar
router.delete('/disconnect', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            googleTokens: null
        });

        res.status(200).json({
            success: true,
            message: 'Google Calendar disconnected successfully'
        });
    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect Google Calendar',
            error: error.message
        });
    }
});

export default router;
