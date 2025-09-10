import express from 'express';
import {
    createMeeting,
    getMeetings,
    getUpcomingMeetings,
    getTodayMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus
} from '../controllers/meetingController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { hasPermission } from '../Middlewares/hasPermissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Create a new meeting
router.post('/',
    hasPermission('calendar', 'create'),
    createMeeting
);

// Get all meetings with optional filters
router.get('/',
    hasPermission('calendar', 'read'),
    getMeetings
);

// Get upcoming meetings
router.get('/upcoming',
    hasPermission('calendar', 'read'),
    getUpcomingMeetings
);

// Get today's meetings
router.get('/today',
    hasPermission('calendar', 'read'),
    getTodayMeetings
);

// Get a specific meeting by ID
router.get('/:id',
    hasPermission('calendar', 'read'),
    getMeetingById
);

// Update a meeting
router.put('/:id',
    hasPermission('calendar', 'update'),
    updateMeeting
);

// Update meeting status
router.patch('/:id/status',
    hasPermission('calendar', 'update'),
    updateMeetingStatus
);

// Delete a meeting
router.delete('/:id',
    hasPermission('calendar', 'delete'),
    deleteMeeting
);

export default router;
