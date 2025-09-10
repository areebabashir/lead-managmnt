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
import { checkPermission } from '../Middlewares/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Create a new meeting
router.post('/',
    checkPermission('calendar', 'create'),
    createMeeting
);

// Get all meetings with optional filters
router.get('/',
    checkPermission('calendar', 'read'),
    getMeetings
);

// Get upcoming meetings
router.get('/upcoming',
    checkPermission('calendar', 'read'),
    getUpcomingMeetings
);

// Get today's meetings
router.get('/today',
    checkPermission('calendar', 'read'),
    getTodayMeetings
);

// Get a specific meeting by ID
router.get('/:id',
    checkPermission('calendar', 'read'),
    getMeetingById
);

// Update a meeting
router.put('/:id',
    checkPermission('calendar', 'update'),
    updateMeeting
);

// Update meeting status
router.patch('/:id/status',
    checkPermission('calendar', 'update'),
    updateMeetingStatus
);

// Delete a meeting
router.delete('/:id',
    checkPermission('calendar', 'delete'),
    deleteMeeting
);

export default router;
