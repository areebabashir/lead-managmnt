import mongoose from 'mongoose';
import { AIInteraction, AIAssistant } from '../models/aiAssistantModel.js';
import Contact from '../models/contactModel.js';
import geminiService from '../services/geminiService.js';
import { hasPermission } from '../helpers/permissionHelper.js';

// Initialize AI Assistant for user
export const initializeAssistant = async (req, res) => {
  try {
    const userId = req.user._id;

    let assistant = await AIAssistant.findOne({ userId });
    
    if (!assistant) {
      assistant = new AIAssistant({ userId });
      await assistant.save();
    }

    res.status(200).json({
      success: true,
      message: 'AI Assistant initialized successfully',
      data: assistant
    });
  } catch (error) {
    console.error('AI Assistant initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize AI Assistant',
      error: error.message
    });
  }
};

// Generate personalized email
export const generatePersonalizedEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId, emailType, context } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to generate emails'
      });
    }

    // Get contact data (optional)
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

    // Generate email using Gemini
    const result = await geminiService.generatePersonalizedEmail(
      contact,
      emailType || 'followup',
      context || ''
    );

    // Save interaction
    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'General';
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

    // Update assistant usage
    await AIAssistant.findOneAndUpdate(
      { userId },
      {
        $inc: { 'usage.totalInteractions': 1 },
        $set: { 'usage.lastUsed': new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Email generated successfully',
      data: {
        email: result.email,
        isCached: result.isCached,
        interactionId: interaction._id
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

// Suggest follow-up time
export const suggestFollowUpTime = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId, urgency, lastInteraction } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to generate follow-up suggestions'
      });
    }

    // Get contact data
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Generate follow-up suggestion
    const result = await geminiService.suggestFollowUpTime(
      contact,
      lastInteraction || contact.lastInteractionDate,
      urgency || 'normal'
    );

    // Save interaction
    const interaction = new AIInteraction({
      type: 'followup',
      prompt: `Suggest follow-up time for ${contact.firstName} ${contact.lastName}`,
      response: result.suggestion,
      metadata: {
        contactId,
        userId,
        context: `urgency: ${urgency}, lastInteraction: ${lastInteraction}`,
        model: 'gemini-pro'
      },
      cacheKey: `followup:${contactId}:${urgency}:${lastInteraction}`,
      isCached: result.isCached
    });
    await interaction.save();

    // Update assistant usage
    await AIAssistant.findOneAndUpdate(
      { userId },
      {
        $inc: { 'usage.totalInteractions': 1 },
        $set: { 'usage.lastUsed': new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Follow-up suggestion generated successfully',
      data: {
        suggestion: result.suggestion,
        isCached: result.isCached,
        interactionId: interaction._id
      }
    });
  } catch (error) {
    console.error('Follow-up suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate follow-up suggestion',
      error: error.message
    });
  }
};

// Summarize meeting notes
export const summarizeMeetingNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { meetingTitle, participants, agenda, keyPoints, actionItems, nextSteps, additionalNotes } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to summarize notes'
      });
    }

    if (!meetingTitle || meetingTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Meeting title is required'
      });
    }

    // Generate summary using Gemini
    const result = await geminiService.summarizeMeetingNotes({
      meetingTitle,
      participants,
      agenda,
      keyPoints,
      actionItems,
      nextSteps,
      additionalNotes
    });

    // Save interaction
    const interaction = new AIInteraction({
      type: 'meeting_notes',
      prompt: `Generate meeting notes for: ${meetingTitle}`,
      response: result.summary,
      metadata: {
        userId,
        meetingTitle,
        participants,
        agenda,
        keyPoints,
        actionItems,
        nextSteps,
        additionalNotes,
        model: 'gemini-pro'
      },
      cacheKey: `meeting:${meetingTitle}:${JSON.stringify({participants, agenda, keyPoints})}`,
      isCached: result.isCached
    });
    await interaction.save();

    // Update assistant usage
    await AIAssistant.findOneAndUpdate(
      { userId },
      {
        $inc: { 'usage.totalInteractions': 1 },
        $set: { 'usage.lastUsed': new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Meeting notes summarized successfully',
      data: {
        summary: result.summary,
        isCached: result.isCached,
        interactionId: interaction._id
      }
    });
  } catch (error) {
    console.error('Meeting summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize meeting notes',
      error: error.message
    });
  }
};

// Process dictation to text
export const processDictation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { audioText, context } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to process dictation'
      });
    }

    if (!audioText || audioText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Audio text is required'
      });
    }

    // Process dictation using Gemini
    const result = await geminiService.processDictation(audioText, context || '');

    // Save interaction
    const interaction = new AIInteraction({
      type: 'dictation',
      prompt: `Process dictation: ${audioText.substring(0, 100)}...`,
      response: result.processedText,
      metadata: {
        userId,
        context,
        model: 'gemini-pro'
      },
      cacheKey: `dictation:${audioText.substring(0, 100)}:${context}`,
      isCached: result.isCached
    });
    await interaction.save();

    // Update assistant usage
    await AIAssistant.findOneAndUpdate(
      { userId },
      {
        $inc: { 'usage.totalInteractions': 1 },
        $set: { 'usage.lastUsed': new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Dictation processed successfully',
      data: {
        processedText: result.processedText,
        isCached: result.isCached,
        interactionId: interaction._id
      }
    });
  } catch (error) {
    console.error('Dictation processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process dictation',
      error: error.message
    });
  }
};

// Process custom AI prompt
export const processCustomPrompt = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, context } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'ai_generator', 'generate')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to process custom prompts'
      });
    }

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Process custom prompt using Gemini
    const result = await geminiService.processCustomPrompt(prompt, context || '');

    // Save interaction
    const interaction = new AIInteraction({
      type: 'custom_prompt',
      prompt: prompt.substring(0, 200),
      response: result.response,
      metadata: {
        userId,
        context,
        model: 'gemini-pro'
      },
      cacheKey: `custom:${prompt.substring(0, 100)}:${JSON.stringify(context)}`,
      isCached: result.isCached
    });
    await interaction.save();

    // Update assistant usage
    await AIAssistant.findOneAndUpdate(
      { userId },
      {
        $inc: { 'usage.totalInteractions': 1 },
        $set: { 'usage.lastUsed': new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Custom prompt processed successfully',
      data: {
        response: result.response,
        isCached: result.isCached,
        interactionId: interaction._id
      }
    });
  } catch (error) {
    console.error('Custom prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process custom prompt',
      error: error.message
    });
  }
};

// Get AI Assistant analytics
export const getAssistantAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check permissions
    if (!await hasPermission(req.user._id, 'dashboards', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view analytics'
      });
    }

    // Get assistant data
    const assistant = await AIAssistant.findOne({ userId });
    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'AI Assistant not found'
      });
    }

    // Get recent interactions
    const recentInteractions = await AIInteraction.find({ 'metadata.userId': userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('metadata.contactId', 'firstName lastName company');

    // Get interaction counts by type
    const interactionStats = await AIInteraction.aggregate([
      { $match: { 'metadata.userId': new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get cache statistics
    const cacheStats = await geminiService.getCacheStats();

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        assistant,
        recentInteractions,
        interactionStats,
        cacheStats
      }
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

// Get interaction history
export const getInteractionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, contactId } = req.query;

    // Check permissions
    if (!await hasPermission(req.user._id, 'dashboards', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view interaction history'
      });
    }

    // Build query
    const query = { 'metadata.userId': userId };
    if (type) query.type = type;
    if (contactId) query['metadata.contactId'] = contactId;

    // Get interactions with pagination
    const interactions = await AIInteraction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('metadata.contactId', 'firstName lastName company');

    // Get total count
    const total = await AIInteraction.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Interaction history retrieved successfully',
      data: {
        interactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Interaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interaction history',
      error: error.message
    });
  }
};

// Update AI Assistant settings
export const updateAssistantSettings = async (req, res) => {
  try {
    const { userId } = req.user;
    const { settings } = req.body;

    // Check permissions
    if (!await hasPermission(req.user._id, 'users', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update settings'
      });
    }

    // Update settings
    const assistant = await AIAssistant.findOneAndUpdate(
      { userId },
      { $set: { settings } },
      { new: true, runValidators: true }
    );

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'AI Assistant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: assistant
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Clear expired cache
export const clearExpiredCache = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check permissions
    if (!await hasPermission(req.user._id, 'users', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to clear cache'
      });
    }

    // Clear expired cache
    const deletedCount = await geminiService.clearExpiredCache();

    res.status(200).json({
      success: true,
      message: 'Expired cache cleared successfully',
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Cache clearing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear expired cache',
      error: error.message
    });
  }
};
