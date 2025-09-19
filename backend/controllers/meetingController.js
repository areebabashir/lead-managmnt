import Meeting from '../models/meetingModel.js';
import googleCalendarService from '../services/googleCalendarService.js';
import User from '../models/authModel.js';

// Create a new meeting
export const createMeeting = async (req, res) => {
    try {
        const meetingData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Validate date format (should be YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingData.date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // Get user information for Google Calendar integration
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create meeting in database first
        const meeting = new Meeting(meetingData);
        await meeting.save();

        // Try to create Google Calendar event if refresh token is available
        let googleCalendarResult = null;
        try {
            // Check if we have valid Google Calendar credentials
            const hasValidCredentials = await googleCalendarService.hasValidCredentials();
            
            if (hasValidCredentials) {
                // Create Google Calendar event
                googleCalendarResult = await googleCalendarService.createCalendarEvent(
                    meetingData, 
                    user.email
                );

                if (googleCalendarResult.success) {
                    // Update meeting with Google Calendar information
                    meeting.googleEventId = googleCalendarResult.eventId;
                    meeting.googleMeetLink = googleCalendarResult.meetLink;
                    meeting.googleEventLink = googleCalendarResult.eventLink;
                    await meeting.save();

                    // Send meeting invitations to host and guests
                    try {
                        // Prepare email recipients
                        const emailRecipients = [];
                        
                        // Add host email
                        if (meetingData.hostEmail) {
                            emailRecipients.push(meetingData.hostEmail);
                        }
                        
                        // Add guest emails
                        if (meetingData.guestEmails && meetingData.guestEmails.length > 0) {
                            emailRecipients.push(...meetingData.guestEmails);
                        }
                        
                        // Fall back to attendees if host/guest info not provided
                        if (emailRecipients.length === 0 && meetingData.attendees && meetingData.attendees.length > 0) {
                            emailRecipients.push(...meetingData.attendees);
                        }

                        if (emailRecipients.length > 0) {
                            await googleCalendarService.sendMeetingInvitation(
                                {
                                    ...meetingData,
                                    hostName: meetingData.hostName,
                                    guestNames: meetingData.guestNames
                                },
                                googleCalendarResult.meetLink,
                                googleCalendarResult.eventLink,
                                emailRecipients
                            );
                            console.log(`📧 Meeting invitations sent to: ${emailRecipients.join(', ')}`);
                        }
                    } catch (emailError) {
                        console.error('Error sending meeting invitations:', emailError);
                        // Don't fail the entire request if email sending fails
                    }
                }
            }
        } catch (googleError) {
            console.error('Google Calendar integration error:', googleError);
            // Don't fail the meeting creation if Google Calendar fails
        }

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            data: {
                ...meeting.toObject(),
                googleCalendarCreated: googleCalendarResult?.success || false,
                googleMeetLink: meeting.googleMeetLink
            }
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create meeting',
            error: error.message
        });
    }
};

// Get all meetings for a user
export const getMeetings = async (req, res) => {
    try {
        const { status, type, priority, date } = req.query;
        const filter = { createdBy: req.user._id, isActive: true };

        // Add filters if provided
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (date) {
            // Filter by exact date string match
            filter.date = date;
        }

        const meetings = await Meeting.find(filter)
            .sort({ date: 1, startTime: 1 })
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meetings',
            error: error.message
        });
    }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (req, res) => {
    try {
        // Get today's date in YYYY-MM-DD format without timezone issues
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        const meetings = await Meeting.find({
            createdBy: req.user._id,
            isActive: true,
            status: 'scheduled',
            date: { $gte: todayString }
        })
        .sort({ date: 1, startTime: 1 })
        .limit(10);

        res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming meetings',
            error: error.message
        });
    }
};

// Get today's meetings
export const getTodayMeetings = async (req, res) => {
    try {
        // Get today's date in YYYY-MM-DD format without timezone issues
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const meetings = await Meeting.find({
            createdBy: req.user._id,
            isActive: true,
            status: 'scheduled',
            date: todayString
        })
        .sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        console.error('Error fetching today\'s meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch today\'s meetings',
            error: error.message
        });
    }
};

// Get a single meeting by ID
export const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
            isActive: true
        }).populate('createdBy', 'name email');

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            data: meeting
        });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting',
            error: error.message
        });
    }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            _id: req.params.id, 
            createdBy: req.user._id, 
            isActive: true
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Update meeting in database
        const updatedMeeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id, isActive: true },
            req.body,
            { new: true, runValidators: true }
        );

        // Update Google Calendar event if it exists and refresh token is available
        if (meeting.googleEventId) {
            try {
                const hasValidCredentials = await googleCalendarService.hasValidCredentials();
                if (hasValidCredentials) {
                    const user = await User.findById(req.user._id);
                    const googleCalendarResult = await googleCalendarService.updateCalendarEvent(
                        meeting.googleEventId,
                        req.body,
                        user.email
                    );

                    if (googleCalendarResult.success) {
                        // Update Google Meet link if it changed
                        if (googleCalendarResult.meetLink) {
                            updatedMeeting.googleMeetLink = googleCalendarResult.meetLink;
                            await updatedMeeting.save();
                        }
                    }
                }
            } catch (googleError) {
                console.error('Google Calendar update error:', googleError);
                // Don't fail the meeting update if Google Calendar fails
            }
        }

        res.status(200).json({
            success: true,
            message: 'Meeting updated successfully',
            data: updatedMeeting
        });
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update meeting',
            error: error.message
        });
    }
};

// Delete a meeting (soft delete)
export const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            _id: req.params.id, 
            createdBy: req.user._id, 
            isActive: true
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Delete from Google Calendar if it exists
        if (meeting.googleEventId) {
            try {
                const hasValidCredentials = await googleCalendarService.hasValidCredentials();
                if (hasValidCredentials) {
                    await googleCalendarService.deleteCalendarEvent(meeting.googleEventId);
                }
            } catch (googleError) {
                console.error('Google Calendar delete error:', googleError);
                // Don't fail the meeting deletion if Google Calendar fails
            }
        }

        // Soft delete the meeting
        await Meeting.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id, isActive: true },
            { isActive: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete meeting',
            error: error.message
        });
    }
};

// Update meeting status
export const updateMeetingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be scheduled, completed, or cancelled'
            });
        }

        const meeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id, isActive: true },
            { status },
            { new: true }
        );

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting status updated successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Error updating meeting status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update meeting status',
            error: error.message
        });
    }
};
