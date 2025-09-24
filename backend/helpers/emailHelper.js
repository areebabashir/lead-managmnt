import { google } from "googleapis";
import dotenv from "dotenv";
import EmailAccount from "../models/emailAccountModel.js";

dotenv.config();

// Google OAuth credentials (still from env for client setup)
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Function to get active email account and set up OAuth client
async function getActiveEmailAccount() {
  try {
    const activeAccount = await EmailAccount.findOne({ isActive: true });
    
    if (!activeAccount) {
      throw new Error('No active email account found. Please activate an email account in settings.');
    }

    if (!activeAccount.google?.refreshToken) {
      throw new Error('Active email account does not have a valid refresh token. Please reconnect your Google account.');
    }

    return activeAccount;
  } catch (error) {
    console.error('Error getting active email account:', error);
    throw error;
  }
}

// Function to get configured Gmail client with active account tokens
async function getGmailClient() {
  try {
    const activeAccount = await getActiveEmailAccount();
    
    // Set credentials for the active account
    oAuth2Client.setCredentials({
      refresh_token: activeAccount.google.refreshToken,
      access_token: activeAccount.google.accessToken,
      expiry_date: activeAccount.google.expiryDate
    });

    return google.gmail({ version: "v1", auth: oAuth2Client });
  } catch (error) {
    console.error('Error setting up Gmail client:', error);
    throw error;
  }
}

/**
 * Decode base64 email body
 */
function decodeEmailBody(base64Data) {
  if (!base64Data) return '';
  return Buffer.from(base64Data, 'base64').toString('utf-8');
}

/**
 * Send an email
 */
export async function sendEmail(to, subject, text) {
  try {
    const gmail = await getGmailClient();
    const activeAccount = await getActiveEmailAccount();
    
    const message = [
      `From: ${activeAccount.displayName || 'Company'} <${activeAccount.email}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      text,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    return res.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * List messages (optionally with query e.g. "is:unread")
 */
export async function listMessages(query = "", maxResults = 10) {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: maxResults,
    });
    console.log("List messages:", res.data.messages);
    return res.data.messages || [];
  } catch (error) {
    console.error('Error listing messages:', error);
    throw error;
  }
}

/**
 * Get full message content
 */
export async function getMessage(messageId) {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full", // can be 'metadata' or 'minimal'
    });
    console.log("Message:", res.data);
    return res.data;
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
}

/**
 * Modify message (e.g. mark read/unread, apply label)
 */
export async function modifyMessage(messageId, labelsToAdd = [], labelsToRemove = []) {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: labelsToAdd,
        removeLabelIds: labelsToRemove,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error modifying message:', error);
    throw error;
  }
}

/**
 * List all labels
 */
export async function listLabels() {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.labels.list({ userId: "me" });
    return res.data.labels || [];
  } catch (error) {
    console.error('Error listing labels:', error);
    throw error;
  }
}

/**
 * Get a thread (all messages in conversation)
 */
export async function getThread(threadId) {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
    });
    
    // Decode the base64 email body
    const message = res.data.messages[0];
    if (message.payload && message.payload.body && message.payload.body.data) {
      const decodedBody = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      console.log("Decoded email body:", decodedBody);
    }
    
    console.log("Thread:", res.data);
    return res.data;
  } catch (error) {
    console.error('Error getting thread:', error);
    throw error;
  }
}

/**
 * Get mailbox history since a given historyId (for syncing)
 */
export async function getHistory(startHistoryId) {
  try {
    const gmail = await getGmailClient();
    
    const res = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: ["messageAdded", "messageDeleted"],
    });
    return res.data.history || [];
  } catch (error) {
    console.error('Error getting history:', error);
    throw error;
  }
}

/**
 * Sync Gmail inbox emails to database
 */
export async function syncInboxEmails(userId, maxResults = 50) {
  try {
    // Get active email account to ensure we're syncing from the right account
    const activeAccount = await getActiveEmailAccount();
    
    // Get recent messages from Gmail
    const messages = await listMessages('in:inbox', maxResults);
    
    if (!messages || messages.length === 0) {
      return { synced: 0, errors: [] };
    }

    const Email = (await import('../models/emailModel.js')).default;
    const errors = [];
    let synced = 0;

    for (const message of messages) {
      try {
        // Check if email already exists
        const existingEmail = await Email.findOne({ 
          'metadata.gmailMessageId': message.id 
        });

        if (existingEmail) {
          continue; // Skip if already synced
        }

        // Get full message details
        const fullMessage = await getMessage(message.id);
        const payload = fullMessage.payload;
        
        // Extract email data
        const emailData = extractEmailData(payload, fullMessage, userId, activeAccount);
        
        if (emailData) {
          const email = new Email(emailData);
          await email.save();
          synced++;
        }
      } catch (error) {
        console.error(`Error syncing message ${message.id}:`, error);
        errors.push({ messageId: message.id, error: error.message });
      }
    }

    return { synced, errors };
  } catch (error) {
    console.error('Error syncing inbox emails:', error);
    throw error;
  }
}

/**
 * Extract email data from Gmail message payload
 */
function extractEmailData(payload, fullMessage, userId, activeAccount = null) {
  try {
    const headers = payload.headers || [];
    
    // Extract basic headers
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    
    const subject = getHeader('Subject');
    const from = getHeader('From');
    const to = getHeader('To');
    const date = getHeader('Date');
    
    if (!subject || !from) {
      return null; // Skip if essential data is missing
    }

    // Extract email body
    let body = '';
    if (payload.body && payload.body.data) {
      body = decodeEmailBody(payload.body.data);
    } else if (payload.parts) {
      // Handle multipart messages
      body = extractBodyFromParts(payload.parts);
    }

    // Parse sender information
    const senderMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, from, from];
    const senderName = senderMatch[1]?.trim() || senderMatch[2];
    const senderEmail = senderMatch[2]?.trim() || senderMatch[1];

    // Parse recipient information
    const recipientMatch = to.match(/^(.+?)\s*<(.+?)>$/) || [null, to, to];
    const recipientName = recipientMatch[1]?.trim() || recipientMatch[2];
    const recipientEmail = recipientMatch[2]?.trim() || recipientMatch[1];

    return {
      subject,
      body,
      recipient: {
        email: recipientEmail,
        name: recipientName
      },
      sender: {
        userId: userId,
        email: senderEmail,
        name: senderName
      },
      status: 'received',
      activeEmailAccount: activeAccount ? activeAccount._id : null,
      metadata: {
        gmailMessageId: fullMessage.id,
        threadId: fullMessage.threadId,
        labels: fullMessage.labelIds || [],
        gmailLabels: fullMessage.labelIds || [],
        isRead: !fullMessage.labelIds?.includes('UNREAD'),
        isStarred: fullMessage.labelIds?.includes('STARRED') || false,
        isImportant: fullMessage.labelIds?.includes('IMPORTANT') || false,
        receivedDate: new Date(date),
        emailDirection: 'received',
        // Add active account information for tracking
        activeEmailAccount: activeAccount ? {
          id: activeAccount._id,
          email: activeAccount.email,
          displayName: activeAccount.displayName
        } : null
      }
    };
  } catch (error) {
    console.error('Error extracting email data:', error);
    return null;
  }
}

/**
 * Extract body from multipart message parts
 */
function extractBodyFromParts(parts) {
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return decodeEmailBody(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
      // Fallback to HTML if no plain text
      return decodeEmailBody(part.body.data);
    } else if (part.parts) {
      // Recursively check nested parts
      const nestedBody = extractBodyFromParts(part.parts);
      if (nestedBody) return nestedBody;
    }
  }
  return '';
}


// Export helper functions for use by other modules
export { getActiveEmailAccount, getGmailClient };

// listMessages();
// getMessage("19951abd82bd7f55");
// getThread("19951abd82bd7f55");