import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { AIPromptCache, AIInteraction, AIAssistant } from '../models/aiAssistantModel.js';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.cache = new Map(); // In-memory cache for frequently used prompts
    this.initialized = false;
  }

  // Initialize Gemini service lazily
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Initializing GeminiService...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.initialized = true;
      console.log('GeminiService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GeminiService:', error);
      throw error;
    }
  }

  // Ensure service is initialized before use
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Generate hash for caching
  generatePromptHash(prompt, context = '') {
    const combined = `${prompt}:${context}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  // Check cache first
  async checkCache(prompt, context = '') {
    const hash = this.generatePromptHash(prompt, context);

    // Check in-memory cache first
    if (this.cache.has(hash)) {
      const cached = this.cache.get(hash);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour
        return { response: cached.response, isCached: true };
      }
      this.cache.delete(hash);
    }

    // Check database cache
    try {
      const cached = await AIPromptCache.findOne({ promptHash: hash });
      if (cached && cached.isValid()) {
        await cached.updateUsage();
        // Update in-memory cache
        this.cache.set(hash, {
          response: cached.response,
          timestamp: Date.now()
        });
        return { response: cached.response, isCached: true };
      }
    } catch (error) {
      console.error('Cache check error:', error);
    }

    return { isCached: false };
  }

  // Save to cache
  async saveToCache(prompt, response, context = '') {
    const hash = this.generatePromptHash(prompt, context);

    try {
      // Save to in-memory cache
      this.cache.set(hash, {
        response,
        timestamp: Date.now()
      });

      // Save to database cache
      await AIPromptCache.findOneAndUpdate(
        { promptHash: hash },
        {
          promptHash: hash,
          response,
          lastUsed: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  // Generate personalized email
  async generatePersonalizedEmail(contactData, emailType = 'followup', context = '') {
    await this.ensureInitialized();

    // Handle case where no contact data is provided
    const contactInfo = contactData ? `
Contact Information:
- Name: ${contactData.firstName} ${contactData.lastName}
- Company: ${contactData.company || 'N/A'}
- Lead Type: ${contactData.leadType || 'N/A'}
- Last Interaction: ${contactData.lastInteractionDate || 'N/A'}
- Search Area: ${contactData.searchArea || 'N/A'}
- Price Range: ${contactData.priceRange || 'N/A'}` : `
Contact Information:
- General email (no specific contact provided)`;

    const prompt = `Generate a personalized ${emailType} email for a sales contact with the following details:
    
${contactInfo}

Context: ${context}

Requirements:
- Professional but friendly tone
- ${contactData ? 'Reference specific details from their profile' : 'Make it general but professional'}
- Include a clear call-to-action
- Keep it under 150 words
- Make it personal and relevant to their situation

Generate the email:`;

    const cacheKey = `email:${contactData?._id || 'general'}:${emailType}:${JSON.stringify(context)}`;
    const cached = await this.checkCache(prompt, cacheKey);

    if (cached.isCached) {
      return { email: cached.response, isCached: true };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      await this.saveToCache(prompt, response, cacheKey);
      return { email: response, isCached: false };
    } catch (error) {
      console.error('Email generation error:', error);
      throw new Error('Failed to generate personalized email');
    }
  }

  // Suggest follow-up time
  async suggestFollowUpTime(contactData, lastInteraction, urgency = 'normal') {
    await this.ensureInitialized();

    const prompt = `Based on the following contact information, suggest the optimal follow-up time:

Contact Details:
- Name: ${contactData.firstName} ${contactData.lastName}
- Lead Type: ${contactData.leadType || 'N/A'}
- Status: ${contactData.status || 'N/A'}
- Last Interaction: ${lastInteraction}
- Urgency Level: ${urgency}

Consider factors like:
- Lead type and status
- Time since last interaction
- Urgency level
- Best practices for sales follow-ups

Provide a specific recommendation with reasoning:`;

    const cacheKey = `followup:${contactData._id}:${urgency}:${lastInteraction}`;
    const cached = await this.checkCache(prompt, cacheKey);

    if (cached.isCached) {
      return { suggestion: cached.response, isCached: true };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      await this.saveToCache(prompt, response, cacheKey);
      return { suggestion: response, isCached: false };
    } catch (error) {
      console.error('Follow-up suggestion error:', error);
      throw new Error('Failed to generate follow-up suggestion');
    }
  }

  // Summarize meeting notes
  async summarizeMeetingNotes(meetingData, context = '') {
    await this.ensureInitialized();

    const { meetingTitle, participants, agenda, keyPoints, actionItems, nextSteps, additionalNotes } = meetingData;

    const prompt = `Generate comprehensive meeting notes for the following meeting:

Meeting Title: ${meetingTitle}

Participants: ${participants ? participants.join(', ') : 'Not specified'}

Agenda Items:
${agenda ? agenda.map((item, index) => `${index + 1}. ${item}`).join('\n') : 'No agenda items provided'}

Key Points Discussed:
${keyPoints ? keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n') : 'No key points provided'}

Action Items:
${actionItems ? actionItems.map((item, index) => `${index + 1}. ${item}`).join('\n') : 'No action items provided'}

Next Steps:
${nextSteps ? nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n') : 'No next steps provided'}

Additional Notes: ${additionalNotes || 'None'}

Please format this into a professional meeting summary with:
1. Meeting overview
2. Key discussion points
3. Decisions made
4. Action items with owners (if specified)
5. Next steps and timeline
6. Follow-up requirements

Make it clear, organized, and actionable:`;

    const cacheKey = `meeting:${meetingTitle}:${JSON.stringify({ participants, agenda, keyPoints })}`;
    const cached = await this.checkCache(prompt, cacheKey);

    if (cached.isCached) {
      return { summary: cached.response, isCached: true };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      await this.saveToCache(prompt, response, cacheKey);
      return { summary: response, isCached: false };
    } catch (error) {
      console.error('Meeting summary error:', error);
      throw new Error('Failed to summarize meeting notes');
    }
  }

  // Process dictation to text
  async processDictation(audioText, context = '') {
    await this.ensureInitialized();

    const prompt = `Process and improve the following dictated text. Make it more professional and readable while maintaining the original meaning:

Dictated Text:
${audioText}

Context: ${context}

Please:
1. Fix grammar and punctuation
2. Improve sentence structure
3. Make it more professional
4. Maintain the original intent
5. Format it appropriately for the context

Improved text:`;

    const cacheKey = `dictation:${audioText.substring(0, 100)}:${context}`;
    const cached = await this.checkCache(prompt, cacheKey);

    if (cached.isCached) {
      return { processedText: cached.response, isCached: true };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      await this.saveToCache(prompt, response, cacheKey);
      return { processedText: response, isCached: false };
    } catch (error) {
      console.error('Dictation processing error:', error);
      throw new Error('Failed to process dictation');
    }
  }

  // Custom AI prompt
  async processCustomPrompt(prompt, context = '') {
    await this.ensureInitialized();

    const cacheKey = `custom:${prompt.substring(0, 100)}:${context}`;
    const cached = await this.checkCache(prompt, context);

    if (cached.isCached) {
      return { response: cached.response, isCached: true };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      await this.saveToCache(prompt, response, cacheKey);
      return { response, isCached: false };
    } catch (error) {
      console.error('Custom prompt error:', error);
      throw new Error('Failed to process custom prompt');
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const totalCached = await AIPromptCache.countDocuments();
      const validCached = await AIPromptCache.countDocuments({
        lastUsed: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      return {
        totalCached,
        validCached,
        inMemoryCacheSize: this.cache.size
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalCached: 0, validCached: 0, inMemoryCacheSize: this.cache.size };
    }
  }

  // Clear expired cache
  async clearExpiredCache() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await AIPromptCache.deleteMany({
        lastUsed: { $lt: sevenDaysAgo }
      });

      // Clear expired in-memory cache
      for (const [key, value] of this.cache.entries()) {
        if (Date.now() - value.timestamp > 3600000) { // 1 hour
          this.cache.delete(key);
        }
      }

      return result.deletedCount;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
}

export default new GeminiService();
