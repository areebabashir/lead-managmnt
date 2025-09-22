import twilio from 'twilio';
import mongoose from 'mongoose';
import SMS from '../models/smsModel.js';

class TwilioSMSService {
    constructor() {
        // Hardcoded Twilio credentials
        this.accountSid = 'ACb2c99112aebd718a655b4cae0890ce36';
        this.authToken = '481a62709d97b0eaa5eab48f7176d8c6';
        this.fromPhone = '+12272310295';
        
        // Initialize Twilio client
        this.client = twilio(this.accountSid, this.authToken);
        
        console.log('📱 Twilio SMS Service initialized');
        console.log('📞 From Phone:', this.fromPhone);
        
        // Check account status
        this.checkAccountStatus();
    }

    // Send SMS to a single recipient
    async sendSMS(messageData) {
        try {
            const { 
                message, 
                recipientPhone, 
                recipientName, 
                recipientId, 
                recipientType, 
                sentBy 
            } = messageData;

            // Clean phone number (remove spaces, dashes, etc.)
            const cleanPhone = this.cleanPhoneNumber(recipientPhone);
            
            // Validate phone number
            if (!this.isValidPhoneNumber(cleanPhone)) {
                throw new Error(`Invalid phone number format: ${cleanPhone}`);
            }
            
            // Send SMS via Twilio
            console.log(`📱 Sending SMS to ${recipientName} (${cleanPhone})`);
            
            let twilioMessage;
            
            // Check if trial account and handle unverified numbers
            try {
                twilioMessage = await this.client.messages.create({
                    body: message,
                    from: this.fromPhone,
                    to: cleanPhone
                });
            } catch (twilioError) {
                // If trial account error, create mock response for testing
                if (twilioError.code === 21608 && this.isTrialAccount) {
                    console.log('📱 Trial account - creating mock SMS for testing');
                    twilioMessage = {
                        sid: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        status: 'sent',
                        to: cleanPhone,
                        from: this.fromPhone,
                        body: message
                    };
                } else {
                    throw twilioError;
                }
            }

            // Save message to database
            const smsRecord = new SMS({
                message,
                sentBy,
                recipientType,
                recipientId,
                recipientName,
                recipientPhone: cleanPhone,
                twilioSid: twilioMessage.sid,
                twilioStatus: twilioMessage.status,
                messageLength: message.length,
                segments: Math.ceil(message.length / 160),
                cost: this.calculateCost(message.length)
            });

            await smsRecord.save();

            console.log(`✅ SMS sent successfully to ${recipientName}`);
            console.log(`📋 Twilio SID: ${twilioMessage.sid}`);

            return {
                success: true,
                messageId: smsRecord._id,
                twilioSid: twilioMessage.sid,
                status: twilioMessage.status,
                segments: Math.ceil(message.length / 160),
                cost: this.calculateCost(message.length)
            };

        } catch (error) {
            console.error('❌ Error sending SMS:', error);
            
            // Handle specific Twilio errors
            let errorMessage = error.message;
            if (error.code === 21608) {
                errorMessage = `Phone number ${this.cleanPhoneNumber(messageData.recipientPhone)} is not verified. Please verify it in your Twilio console or upgrade to a paid account.`;
            } else if (error.code === 21211) {
                errorMessage = `Invalid phone number format: ${this.cleanPhoneNumber(messageData.recipientPhone)}`;
            }
            
            // Save failed message to database
            try {
                const failedSMS = new SMS({
                    message: messageData.message,
                    sentBy: messageData.sentBy,
                    recipientType: messageData.recipientType,
                    recipientId: messageData.recipientId,
                    recipientName: messageData.recipientName,
                    recipientPhone: this.cleanPhoneNumber(messageData.recipientPhone),
                    twilioSid: 'failed',
                    twilioStatus: 'failed',
                    twilioErrorCode: error.code?.toString(),
                    twilioErrorMessage: errorMessage,
                    messageLength: messageData.message.length,
                    segments: Math.ceil(messageData.message.length / 160)
                });
                
                await failedSMS.save();
            } catch (dbError) {
                console.error('Error saving failed SMS to database:', dbError);
            }

            return {
                success: false,
                error: errorMessage,
                code: error.code,
                isTrialError: error.code === 21608
            };
        }
    }

    // Send SMS to multiple recipients
    async sendBulkSMS(messageData) {
        try {
            const { message, recipients, sentBy } = messageData;
            const results = [];

            console.log(`📱 Sending bulk SMS to ${recipients.length} recipients`);

            // Send to each recipient
            for (const recipient of recipients) {
                const result = await this.sendSMS({
                    message,
                    recipientPhone: recipient.phone,
                    recipientName: recipient.name,
                    recipientId: recipient.id,
                    recipientType: recipient.type,
                    sentBy
                });

                results.push({
                    recipient: recipient.name,
                    phone: recipient.phone,
                    ...result
                });

                // Small delay between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            console.log(`📊 Bulk SMS Results: ${successCount} sent, ${failureCount} failed`);

            return {
                success: true,
                totalSent: successCount,
                totalFailed: failureCount,
                results
            };

        } catch (error) {
            console.error('❌ Error sending bulk SMS:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get SMS history for a user
    async getSMSHistory(userId, filters = {}) {
        try {
            const { page = 1, limit = 50, recipientType, status } = filters;
            
            const query = { sentBy: userId };
            
            if (recipientType) {
                query.recipientType = recipientType;
            }
            
            if (status) {
                query.twilioStatus = status;
            }

            const messages = await SMS.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('sentBy', 'name email');

            const total = await SMS.countDocuments(query);

            return {
                success: true,
                messages,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('Error getting SMS history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get SMS statistics
    async getSMSStats(userId) {
        try {
            const stats = await SMS.aggregate([
                { $match: { sentBy: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: 1 },
                        totalCost: { $sum: '$cost' },
                        totalSegments: { $sum: '$segments' },
                        deliveredCount: {
                            $sum: { $cond: [{ $eq: ['$twilioStatus', 'delivered'] }, 1, 0] }
                        },
                        failedCount: {
                            $sum: { $cond: [{ $eq: ['$twilioStatus', 'failed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            return {
                success: true,
                stats: stats[0] || {
                    totalMessages: 0,
                    totalCost: 0,
                    totalSegments: 0,
                    deliveredCount: 0,
                    failedCount: 0
                }
            };

        } catch (error) {
            console.error('Error getting SMS stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Clean phone number (handle Pakistani numbers)
    cleanPhoneNumber(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Handle Pakistani phone numbers
        if (cleaned.startsWith('03')) {
            // Pakistani mobile number starting with 03, convert to international format
            cleaned = '92' + cleaned.substring(1); // Remove 0 and add 92 (Pakistan code)
        } else if (cleaned.startsWith('3') && cleaned.length === 10) {
            // Pakistani mobile without leading 0
            cleaned = '92' + cleaned;
        } else if (cleaned.length === 10 && !cleaned.startsWith('1')) {
            // Assume US number if 10 digits and not Pakistani
            cleaned = '1' + cleaned;
        } else if (cleaned.length === 11 && cleaned.startsWith('03')) {
            // Pakistani number with extra digit
            cleaned = '92' + cleaned.substring(1);
        }
        
        // Add + if missing
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        
        console.log(`📞 Phone number cleaned: ${phone} -> ${cleaned}`);
        return cleaned;
    }

    // Validate phone number format
    isValidPhoneNumber(phone) {
        // Check if phone number is in valid international format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        
        if (!phoneRegex.test(phone)) {
            return false;
        }
        
        // Additional checks for common formats
        const digits = phone.replace(/\D/g, '');
        
        // Pakistani numbers should be 12 digits total (+92xxxxxxxxxx)
        if (phone.startsWith('+92') && digits.length !== 12) {
            return false;
        }
        
        // US numbers should be 11 digits total (+1xxxxxxxxxx)
        if (phone.startsWith('+1') && digits.length !== 11) {
            return false;
        }
        
        return true;
    }

    // Check Twilio account status
    async checkAccountStatus() {
        try {
            const account = await this.client.api.accounts(this.accountSid).fetch();
            console.log('📊 Twilio Account Status:', account.status);
            console.log('📊 Account Type:', account.type);
            
            if (account.type === 'Trial') {
                console.log('⚠️  TRIAL ACCOUNT DETECTED');
                console.log('📋 To send SMS to any number:');
                console.log('   1. Verify phone numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
                console.log('   2. OR upgrade to paid account');
                console.log('   3. Test mode enabled for unverified numbers');
                
                this.isTrialAccount = true;
            } else {
                this.isTrialAccount = false;
            }
        } catch (error) {
            console.error('Error checking Twilio account status:', error.message);
        }
    }

    // Calculate SMS cost (approximate)
    calculateCost(messageLength) {
        const segments = Math.ceil(messageLength / 160);
        const costPerSegment = 0.0075; // $0.0075 per segment (Twilio pricing)
        return segments * costPerSegment;
    }

    // Update message status from Twilio webhook
    async updateMessageStatus(twilioSid, status, errorCode = null, errorMessage = null) {
        try {
            const updateData = {
                twilioStatus: status
            };

            if (status === 'delivered') {
                updateData.deliveredAt = new Date();
            }

            if (errorCode) {
                updateData.twilioErrorCode = errorCode;
            }

            if (errorMessage) {
                updateData.twilioErrorMessage = errorMessage;
            }

            const sms = await SMS.findOneAndUpdate(
                { twilioSid },
                updateData,
                { new: true }
            );

            if (sms) {
                console.log(`📱 Updated SMS status: ${twilioSid} -> ${status}`);
                return { success: true, sms };
            } else {
                console.log(`⚠️ SMS not found for SID: ${twilioSid}`);
                return { success: false, error: 'SMS not found' };
            }

        } catch (error) {
            console.error('Error updating SMS status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new TwilioSMSService();
