import express from 'express';
import {
    generateTranscript,
    generateSummary,
    createMeetingNote,
    getMeetingNotes,
    getMeetingNote,
    updateMeetingNote,
    deleteMeetingNote,
    getMeetingNotesStats,
    upload
} from '../controllers/meetingNotesController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { hasPermission } from '../Middlewares/hasPermissionMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Audio processing routes
router.post('/transcript', 
    upload.single('audioFile'), 
    generateTranscript
);

router.post('/summary', 
    generateSummary
);

// CRUD operations
router.post('/', 
    // hasPermission('meeting_notes', 'create'), 
    createMeetingNote
);

router.get('/', 
    // hasPermission('meeting_notes', 'read'), 
    getMeetingNotes
);

router.get('/stats', 
    // hasPermission('meeting_notes', 'read'), 
    getMeetingNotesStats
);

router.get('/:id', 
    // hasPermission('meeting_notes', 'read'), 
    getMeetingNote
);

router.put('/:id', 
    // hasPermission('meeting_notes', 'update'), 
    updateMeetingNote
);

router.delete('/:id', 
    // hasPermission('meeting_notes', 'delete'), 
    deleteMeetingNote
);

export default router;

