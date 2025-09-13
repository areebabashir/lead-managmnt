import Email from '../models/emailModel.js';
import Contact from '../models/contactModel.js';
import User from '../models/authModel.js';
import { AIInteraction } from '../models/aiAssistantModel.js';
import { hasPermission } from '../helpers/permissionHelper.js';
import emailScheduler from '../services/emailScheduler.js';
import geminiService from '../services/geminiService.js';

// Generate and save email (draft)
export const generateAndSaveEmail = async (req, res) => {
  try {
    // console.log('req.body hit');
    const userId = req.user._id;
    const { contactId, emailType, context, subject, body } = req.body;

    // console.log('emailType', emailType);
    console.log('context', context);
    // console.log('subject', subject);
    // console.log('body', body);


    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to generate emails'
      });
    }

    // Get contact data if provided
    let contact = null;
    if (contactId) {
      contact = await Contact.findById(contactId);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }
    }
    // console.log('contact from email controller', contact);

    // Get sender information
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    let generatedContent = { subject: '', body: '' };
    let aiInteractionId = null;

    // Generate email content if not provided
    if (!subject || !body) {
      const result = await geminiService.generatePersonalizedEmail(
        contact,
        emailType || 'followup',
        context || '',
        sender
      );

      // Parse the generated content (assuming it contains both subject and body)
      const lines = result.email.split('\n');
      generatedContent.subject = lines[0] || 'Generated Email Subject';
      generatedContent.body = lines.slice(1).join('\n').trim() || result.email;

      // Save AI interaction
      const contactName = contact ? `${contact.fullName}` : 'General';
      const interaction = new AIInteraction({
        type: 'email',
        prompt: `Generate ${emailType} email for ${contactName}`,
        response: result.email,
        metadata: {
          contactId: contactId || null,
          userId,
          context,
          model: 'gemini-pro'
        },
        cacheKey: `email:${contactId || 'general'}:${emailType}:${JSON.stringify(context)}`,
        isCached: result.isCached
      });
      await interaction.save();
      aiInteractionId = interaction._id;
    }

    // Create email record
    const email = new Email({
      subject: subject || generatedContent.subject,
      body: body || generatedContent.body,
      recipient: {
        email: contact ? contact.email : '',
        name: contact ? contact.fullName : '',
        contactId: contactId || null
      },
      sender: {
        userId: userId,
        email: sender.email,
        name: sender.name
      },
      status: 'draft',
      emailType: emailType || 'custom',
      aiContext: {
        emailType: emailType || 'custom',
        tone: context?.tone || 'professional',
        keyPoints: context?.keyPoints || [],
        callToAction: context?.callToAction || '',
        customInstructions: context?.customInstructions || '',
        generatedBy: (subject && body) ? 'manual' : 'ai',
        aiInteractionId: aiInteractionId
      }
    });

    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email generated and saved as draft',
      data: {
        email: email,
        generatedContent: generatedContent
      }
    });
  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate email',
      error: error.message
    });
  }
};

// Send email immediately
export const sendEmailNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'send')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to send emails'
      });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only send your own emails'
      });
    }

    // Send email immediately
    const result = await emailScheduler.sendEmailNow(emailId);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Schedule email for future sending
export const scheduleEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;
    const { scheduledDate } = req.body;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'schedule')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to schedule emails'
      });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only schedule your own emails'
      });
    }

    // Validate scheduled date
    const scheduleDate = new Date(scheduledDate);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }

    // Schedule the email
    const result = await emailScheduler.scheduleEmail(emailId, scheduleDate);

    res.status(200).json({
      success: true,
      message: 'Email scheduled successfully',
      data: result
    });
  } catch (error) {
    console.error('Schedule email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule email',
      error: error.message
    });
  }
};

// Save email as draft
export const saveEmailDraft = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;
    const { subject, body } = req.body;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to save email drafts'
      });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own emails'
      });
    }

    // Check if email can be edited (only drafts and failed emails)
    if (!['draft', 'failed'].includes(email.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only draft and failed emails can be edited'
      });
    }

    // Update email content
    email.subject = subject || email.subject;
    email.body = body || email.body;
    email.status = 'draft';
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email draft saved successfully',
      data: email
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save email draft',
      error: error.message
    });
  }
};

// Get all emails for a user
export const getUserEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, contactId } = req.query;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view emails'
      });
    }

    // Build query
    const query = { 'sender.userId': userId, isActive: true };
    if (status) query.status = status;
    if (contactId) query['recipient.contactId'] = contactId;

    // Get emails with pagination
    const emails = await Email.find(query)
      .populate('recipient.contactId', 'fullName email')
      .populate('aiContext.aiInteractionId', 'prompt response')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count
    const total = await Email.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Emails retrieved successfully',
      data: {
        emails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emails',
      error: error.message
    });
  }
};

// Get single email by ID
export const getEmailById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view emails'
      });
    }

    const email = await Email.findById(emailId)
      .populate('recipient.contactId', 'fullName email phoneNumber')
      .populate('aiContext.aiInteractionId', 'prompt response');

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own emails'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email retrieved successfully',
      data: email
    });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve email',
      error: error.message
    });
  }
};

// Cancel scheduled email
export const cancelScheduledEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to cancel emails'
      });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own emails'
      });
    }

    // Cancel the scheduled email
    const result = await emailScheduler.cancelScheduledEmail(emailId);

    res.status(200).json({
      success: true,
      message: 'Scheduled email cancelled successfully',
      data: result
    });
  } catch (error) {
    console.error('Cancel email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel email',
      error: error.message
    });
  }
};

// Delete email (soft delete)
export const deleteEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;

    // Check permissions
    if (!await hasPermission(userId, 'ai_generator', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete emails'
      });
    }

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user owns this email
    if (email.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own emails'
      });
    }

    // Check if email can be deleted (not sent emails)
    if (email.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Sent emails cannot be deleted'
      });
    }

    // Soft delete
    email.isActive = false;
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: error.message
    });
  }
};

// Get email statistics
export const getEmailStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check permissions
    if (!await hasPermission(userId, 'dashboards', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view email statistics'
      });
    }

    const stats = await emailScheduler.getEmailStats(userId);

    res.status(200).json({
      success: true,
      message: 'Email statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve email statistics',
      error: error.message
    });
  }
};

// Get contacts for email dropdown
export const getContactsForEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search = '', limit = 50 } = req.query;

    // Check permissions
    if (!await hasPermission(userId, 'contacts', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view contacts'
      });
    }

    // Build search query
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .select('fullName email leadType status')
      .limit(parseInt(limit))
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: error.message
    });
  }
};


