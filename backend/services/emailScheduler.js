import cron from 'node-cron';
import Email from '../models/emailModel.js';
import { sendEmail } from '../helpers/emailHelper.js';
import User from '../models/authModel.js';

class EmailScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
    this.initializeScheduler();
  }

  // Initialize the email scheduler
  initializeScheduler() {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    // Run every minute to check for scheduled emails
    const job = cron.schedule('* * * * *', async () => {
      await this.processScheduledEmails();
    }, {
      scheduled: false
    });

    this.jobs.set('processScheduledEmails', job);
    this.start();
    
    console.log('✅ Email scheduler initialized and started');
  }

  // Start the scheduler
  start() {
    if (this.isRunning) return;
    
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`📧 Started email scheduler job: ${name}`);
    });
    
    this.isRunning = true;
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) return;
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped email scheduler job: ${name}`);
    });
    
    this.isRunning = false;
  }

  // Process scheduled emails that are ready to be sent
  async processScheduledEmails() {
    try {
      const scheduledEmails = await Email.getScheduledEmailsToSend();
      
      if (scheduledEmails.length === 0) {
        return;
      }

      console.log(`📬 Processing ${scheduledEmails.length} scheduled emails`);

      for (const email of scheduledEmails) {
        await this.sendScheduledEmail(email);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled emails:', error);
    }
  }

  // Send a scheduled email
  async sendScheduledEmail(email) {
    try {
      // Update status to sending (only if not already sending)
      if (email.status !== 'sending') {
        await email.updateStatus('sending');
      }

      // Get sender information
      const sender = await User.findById(email.sender.userId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      // Send the email
      const result = await sendEmail(
        email.recipient.email,
        email.subject,
        email.body
      );

      // Update email with success status
      await email.updateStatus('sent', {
        gmailMessageId: result.id,
        threadId: result.threadId
      });

      console.log(`✅ Email sent successfully: ${email._id} to ${email.recipient.email}`);

    } catch (error) {
      console.error(`❌ Failed to send email ${email._id}:`, error);
      
      // Update email with failure status
      await email.updateStatus('failed', { error });
      
      // If retry count is less than max retries, reschedule for later
      if (email.retryCount < email.maxRetries) {
        const retryDelay = Math.pow(2, email.retryCount) * 5; // Exponential backoff: 5, 10, 20 minutes
        const retryDate = new Date(Date.now() + retryDelay * 60 * 1000);
        
        await Email.findByIdAndUpdate(email._id, {
          scheduledDate: retryDate,
          status: 'scheduled'
        });
        
        console.log(`🔄 Email ${email._id} rescheduled for retry in ${retryDelay} minutes`);
      }
    }
  }

  // Schedule an email for future sending
  async scheduleEmail(emailId, scheduledDate) {
    try {
      const email = await Email.findById(emailId);
      if (!email) {
        throw new Error('Email not found');
      }

      if (scheduledDate <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }

      email.scheduledDate = scheduledDate;
      email.status = 'scheduled';
      await email.save();

      console.log(`📅 Email ${emailId} scheduled for ${scheduledDate}`);
      return email;
    } catch (error) {
      console.error('❌ Error scheduling email:', error);
      throw error;
    }
  }

  // Cancel a scheduled email
  async cancelScheduledEmail(emailId) {
    try {
      const email = await Email.findById(emailId);
      if (!email) {
        throw new Error('Email not found');
      }

      if (email.status !== 'scheduled') {
        throw new Error('Only scheduled emails can be cancelled');
      }

      email.status = 'cancelled';
      await email.save();

      console.log(`❌ Email ${emailId} cancelled`);
      return email;
    } catch (error) {
      console.error('❌ Error cancelling email:', error);
      throw error;
    }
  }

  // Send email immediately
  async sendEmailNow(emailId) {
    try {
      const email = await Email.findById(emailId);
      if (!email) {
        throw new Error('Email not found');
      }

      if (email.status === 'sent') {
        throw new Error('Email has already been sent');
      }

      // Update status to sending and process immediately
      email.status = 'sending';
      await email.save();

      // Process immediately without setting scheduled date
      await this.sendScheduledEmail(email);

      return email;
    } catch (error) {
      console.error('❌ Error sending email now:', error);
      throw error;
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  // Get email statistics
  async getEmailStats(userId = null) {
    try {
      const stats = await Email.getEmailStats(userId);
      const totalScheduled = await Email.countDocuments({
        status: 'scheduled',
        isActive: true,
        ...(userId && { 'sender.userId': userId })
      });

      return {
        byStatus: stats,
        totalScheduled,
        schedulerStatus: this.getStatus()
      };
    } catch (error) {
      console.error('❌ Error getting email stats:', error);
      throw error;
    }
  }

  // Clean up old emails (optional maintenance)
  async cleanupOldEmails(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await Email.updateMany(
        {
          status: { $in: ['sent', 'failed', 'cancelled'] },
          createdAt: { $lt: cutoffDate }
        },
        { isActive: false }
      );

      console.log(`🧹 Cleaned up ${result.modifiedCount} old emails`);
      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old emails:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailScheduler = new EmailScheduler();

export default emailScheduler;
