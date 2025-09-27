import MeetingNote from '../models/meetingNoteModel.js';
import { speechToText } from '../helpers/speechtotext.js';
import geminiService from '../services/geminiService.js';
import { hasPermission } from '../helpers/permissionHelper.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'audiiofiles/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only WAV files
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/wave' || path.extname(file.originalname).toLowerCase() === '.wav') {
        cb(null, true);
    } else {
        cb(new Error('Only WAV audio files are allowed'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Generate transcript from uploaded audio file
export const generateTranscript = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'create')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot create meeting notes'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Audio file is required'
            });
        }

        const audioFilePath = req.file.path;
        const { languageCode = 'en-US' } = req.body;

        console.log(`Processing audio file: ${audioFilePath}`);

        // Convert audio to text
        const transcriptResult = await speechToText(audioFilePath, {
            languageCode: languageCode,
            keepProcessedFile: true
        });

        if (!transcriptResult.success) {
            // Clean up uploaded file on failure
            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
            }
            
            return res.status(500).json({
                success: false,
                message: 'Failed to generate transcript',
                error: transcriptResult.error
            });
        }

        const { transcript, confidence, duration, segments } = transcriptResult.data;

        res.json({
            success: true,
            message: 'Transcript generated successfully',
            data: {
                audioFileUrl: audioFilePath,
                audioFileName: req.file.originalname,
                audioFileSize: req.file.size,
                transcript: transcript,
                confidence: confidence,
                duration: duration,
                segments: segments,
                rawTranscriptData: transcriptResult.rawResponse
            }
        });

    } catch (error) {
        console.error('Error generating transcript:', error);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error generating transcript',
            error: error.message
        });
    }
};

// Generate summary from transcript
export const generateSummary = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'create')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot create meeting notes'
            });
        }

        const { transcript, meetingTitle, participants, duration, confidence } = req.body;

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Transcript is required for summary generation'
            });
        }

        // Prepare meeting context for better summarization
        const meetingContext = {
            meetingTitle,
            participants: participants || [],
            duration,
            confidence
        };

        console.log('Generating summary for transcript...');

        // Generate summary using Gemini service
        const summaryResult = await geminiService.summarizeTranscript(transcript, meetingContext);

        res.json({
            success: true,
            message: 'Summary generated successfully',
            data: {
                summary: summaryResult.summary,
                isCached: summaryResult.isCached
            }
        });

    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating summary',
            error: error.message
        });
    }
};

// Create meeting note
export const createMeetingNote = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'create')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot create meeting notes'
            });
        }

        const {
            meetingTitle,
            meetingDate,
            participants,
            audioFileUrl,
            audioFileName,
            audioFileSize,
            transcription,
            rawTranscriptData,
            summary,
            duration,
            confidence,
            tags,
            category
        } = req.body;

        // Validate required fields
        if (!meetingTitle || !meetingDate || !audioFileUrl) {
            return res.status(400).json({
                success: false,
                message: 'Meeting title, date, and audio file URL are required'
            });
        }

        // Process participants array
        const processedParticipants = participants ? participants.map(participant => {
            if (typeof participant === 'string') {
                // Simple participant (just name)
                return {
                    name: participant,
                    type: 'simple'
                };
            } else if (participant.contactId) {
                // Contact reference
                return {
                    contactId: participant.contactId,
                    type: 'contact'
                };
            } else if (participant.name || participant.email) {
                // Simple participant with name and email
                return {
                    name: participant.name,
                    email: participant.email,
                    type: 'simple'
                };
            }
            return null;
        }).filter(p => p !== null) : [];

        // Create meeting note
        const meetingNote = new MeetingNote({
            meetingTitle,
            meetingDate: new Date(meetingDate),
            participants: processedParticipants,
            audioFileUrl,
            audioFileName,
            audioFileSize,
            transcription,
            rawTranscriptData,
            summary,
            duration,
            confidence,
            transcriptionStatus: transcription ? 'completed' : 'pending',
            summaryStatus: summary ? 'completed' : 'pending',
            tags: tags || [],
            category,
            createdBy: req.user._id
        });

        const savedMeetingNote = await meetingNote.save();

        // Populate the saved meeting note
        const populatedMeetingNote = await MeetingNote.findById(savedMeetingNote._id)
            .populate('createdBy', 'name email')
            .populate('participants.contactId', 'fullName email company');

        res.status(201).json({
            success: true,
            message: 'Meeting note created successfully',
            data: populatedMeetingNote
        });

    } catch (error) {
        console.error('Error creating meeting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating meeting note',
            error: error.message
        });
    }
};

// Get all meeting notes
export const getMeetingNotes = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read meeting notes'
            });
        }

        const {
            page = 1,
            limit = 20,
            search,
            category,
            tags,
            dateFrom,
            dateTo,
            sortBy = 'meetingDate',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { isActive: true };

        // Add search functionality
        if (search) {
            query.$or = [
                { meetingTitle: { $regex: search, $options: 'i' } },
                { transcription: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by tags
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            query.tags = { $in: tagArray };
        }

        // Date range filter
        if (dateFrom || dateTo) {
            query.meetingDate = {};
            if (dateFrom) query.meetingDate.$gte = new Date(dateFrom);
            if (dateTo) query.meetingDate.$lte = new Date(dateTo);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const meetingNotes = await MeetingNote.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('participants.contactId', 'fullName email company')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const totalCount = await MeetingNote.countDocuments(query);
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
            success: true,
            data: meetingNotes,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching meeting notes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting notes',
            error: error.message
        });
    }
};

// Get single meeting note
export const getMeetingNote = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read meeting notes'
            });
        }

        const meetingNote = await MeetingNote.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('participants.contactId', 'fullName email company');

        if (!meetingNote || !meetingNote.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meeting note not found'
            });
        }

        res.json({
            success: true,
            data: meetingNote
        });

    } catch (error) {
        console.error('Error fetching meeting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting note',
            error: error.message
        });
    }
};

// Update meeting note
export const updateMeetingNote = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update meeting notes'
            });
        }

        const meetingNote = await MeetingNote.findById(req.params.id);

        if (!meetingNote || !meetingNote.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meeting note not found'
            });
        }

        const {
            meetingTitle,
            meetingDate,
            participants,
            transcription,
            summary,
            tags,
            category
        } = req.body;

        // Update fields if provided
        if (meetingTitle) meetingNote.meetingTitle = meetingTitle;
        if (meetingDate) meetingNote.meetingDate = new Date(meetingDate);
        if (transcription) {
            meetingNote.transcription = transcription;
            meetingNote.transcriptionStatus = 'completed';
        }
        if (summary) {
            meetingNote.summary = summary;
            meetingNote.summaryStatus = 'completed';
        }
        if (tags) meetingNote.tags = tags;
        if (category) meetingNote.category = category;

        // Update participants if provided
        if (participants) {
            const processedParticipants = participants.map(participant => {
                if (typeof participant === 'string') {
                    return {
                        name: participant,
                        type: 'simple'
                    };
                } else if (participant.contactId) {
                    return {
                        contactId: participant.contactId,
                        type: 'contact'
                    };
                } else if (participant.name || participant.email) {
                    return {
                        name: participant.name,
                        email: participant.email,
                        type: 'simple'
                    };
                }
                return null;
            }).filter(p => p !== null);

            meetingNote.participants = processedParticipants;
        }

        meetingNote.updatedBy = req.user._id;
        const updatedMeetingNote = await meetingNote.save();

        // Populate the updated meeting note
        const populatedMeetingNote = await MeetingNote.findById(updatedMeetingNote._id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('participants.contactId', 'fullName email company');

        res.json({
            success: true,
            message: 'Meeting note updated successfully',
            data: populatedMeetingNote
        });

    } catch (error) {
        console.error('Error updating meeting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating meeting note',
            error: error.message
        });
    }
};

// Delete meeting note (soft delete)
export const deleteMeetingNote = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'delete')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot delete meeting notes'
            });
        }

        const meetingNote = await MeetingNote.findById(req.params.id);

        if (!meetingNote || !meetingNote.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meeting note not found'
            });
        }

        // Soft delete
        meetingNote.isActive = false;
        meetingNote.updatedBy = req.user._id;
        await meetingNote.save();

        res.json({
            success: true,
            message: 'Meeting note deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting meeting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting meeting note',
            error: error.message
        });
    }
};

// Get meeting notes statistics
export const getMeetingNotesStats = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'meeting_notes', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read meeting notes'
            });
        }

        const userId = req.user._id;

        // Get various statistics
        const [
            totalNotes,
            recentNotes,
            processingNotes,
            categoryStats,
            monthlyStats
        ] = await Promise.all([
            MeetingNote.countDocuments({ createdBy: userId, isActive: true }),
            MeetingNote.countDocuments({
                createdBy: userId,
                isActive: true,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            MeetingNote.countDocuments({
                createdBy: userId,
                isActive: true,
                $or: [
                    { transcriptionStatus: 'processing' },
                    { summaryStatus: 'processing' }
                ]
            }),
            MeetingNote.aggregate([
                { $match: { createdBy: userId, isActive: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            MeetingNote.aggregate([
                { $match: { createdBy: userId, isActive: true } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$meetingDate' },
                            month: { $month: '$meetingDate' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalNotes,
                recentNotes,
                processingNotes,
                categoryStats,
                monthlyStats
            }
        });

    } catch (error) {
        console.error('Error fetching meeting notes stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting notes statistics',
            error: error.message
        });
    }
};

