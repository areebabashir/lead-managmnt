import twilioSMSService from '../services/twilioSMSService.js';
import Contact from '../models/contactModel.js';
import User from '../models/authModel.js';
import SMS from '../models/smsModel.js';

// Send SMS to single recipient
export const sendSMS = async (req, res) => {
    try {
        const { message, recipientId, recipientType } = req.body;

        // Validate input
        if (!message || !recipientId || !recipientType) {
            return res.status(400).json({
                success: false,
                message: 'Message, recipient ID, and recipient type are required'
            });
        }

        if (!['lead', 'staff'].includes(recipientType)) {
            return res.status(400).json({
                success: false,
                message: 'Recipient type must be either "lead" or "staff"'
            });
        }

        // Get recipient details
        let recipient;
        if (recipientType === 'lead') {
            recipient = await Contact.findById(recipientId);
            if (!recipient || !recipient.phoneNumber) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found or no phone number available'
                });
            }
        } else {
            recipient = await User.findById(recipientId);
            if (!recipient || !recipient.phone) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff member not found or no phone number available'
                });
            }
        }

        // Prepare SMS data
        const smsData = {
            message,
            recipientPhone: recipientType === 'lead' ? recipient.phoneNumber : recipient.phone,
            recipientName: recipientType === 'lead' ? recipient.fullName : recipient.name,
            recipientId,
            recipientType,
            sentBy: req.user._id
        };

        // Send SMS
        const result = await twilioSMSService.sendSMS(smsData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'SMS sent successfully',
                data: {
                    messageId: result.messageId,
                    twilioSid: result.twilioSid,
                    status: result.status,
                    segments: result.segments,
                    cost: result.cost,
                    recipient: {
                        name: smsData.recipientName,
                        phone: smsData.recipientPhone,
                        type: recipientType
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to send SMS',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error in sendSMS controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Send SMS to multiple recipients
export const sendBulkSMS = async (req, res) => {
    try {
        const { message, recipients } = req.body;

        // Validate input
        if (!message || !recipients || !Array.isArray(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'Message and recipients array are required'
            });
        }

        if (recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one recipient is required'
            });
        }

        // Validate recipients and get their details
        const validRecipients = [];
        
        for (const recipient of recipients) {
            const { id, type } = recipient;
            
            let recipientData;
            if (type === 'lead') {
                recipientData = await Contact.findById(id);
                if (recipientData && recipientData.phoneNumber) {
                    validRecipients.push({
                        id: recipientData._id,
                        name: recipientData.fullName,
                        phone: recipientData.phoneNumber,
                        type: 'lead'
                    });
                }
            } else if (type === 'staff') {
                recipientData = await User.findById(id);
                if (recipientData && recipientData.phone) {
                    validRecipients.push({
                        id: recipientData._id,
                        name: recipientData.name,
                        phone: recipientData.phone,
                        type: 'staff'
                    });
                }
            }
        }

        if (validRecipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid recipients found with phone numbers'
            });
        }

        // Send bulk SMS
        const result = await twilioSMSService.sendBulkSMS({
            message,
            recipients: validRecipients,
            sentBy: req.user._id
        });

        res.status(200).json({
            success: true,
            message: `SMS sent to ${result.totalSent} out of ${validRecipients.length} recipients`,
            data: {
                totalSent: result.totalSent,
                totalFailed: result.totalFailed,
                results: result.results
            }
        });

    } catch (error) {
        console.error('Error in sendBulkSMS controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get SMS history for current user
export const getSMSHistory = async (req, res) => {
    try {
        const { page = 1, limit = 50, recipientType, status } = req.query;

        const result = await twilioSMSService.getSMSHistory(req.user._id, {
            page: parseInt(page),
            limit: parseInt(limit),
            recipientType,
            status
        });

        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.messages,
                pagination: result.pagination
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to get SMS history',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error in getSMSHistory controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get SMS statistics for current user
export const getSMSStats = async (req, res) => {
    try {
        const result = await twilioSMSService.getSMSStats(req.user._id);

        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.stats
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to get SMS statistics',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error in getSMSStats controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Twilio webhook handler for status updates
export const handleTwilioWebhook = async (req, res) => {
    try {
        const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;

        console.log(`📱 Twilio webhook: ${MessageSid} -> ${MessageStatus}`);

        const result = await twilioSMSService.updateMessageStatus(
            MessageSid,
            MessageStatus,
            ErrorCode,
            ErrorMessage
        );

        if (result.success) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error in Twilio webhook handler:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get conversation history between user and specific contact
export const getConversation = async (req, res) => {
    try {
        const { recipientId, recipientType } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await SMS.find({
            $or: [
                { sentBy: req.user._id, recipientId, recipientType },
                // Add received messages if you implement two-way SMS later
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first for conversation view
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('sentBy', 'name email');

        const total = await SMS.countDocuments({
            sentBy: req.user._id,
            recipientId,
            recipientType
        });

        res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

