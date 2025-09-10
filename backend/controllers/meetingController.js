import Meeting from '../models/meetingModel.js';

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

        const meeting = new Meeting(meetingData);
        await meeting.save();

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            data: meeting
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
        const meeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id, isActive: true },
            req.body,
            { new: true, runValidators: true }
        );

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting updated successfully',
            data: meeting
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
        const meeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id, isActive: true },
            { isActive: false },
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
