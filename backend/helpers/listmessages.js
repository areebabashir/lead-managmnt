import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Attach refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

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
  const message = [
    `From: Realtech <${process.env.GMAIL_SENDER}>`,
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
}

/**
 * List messages (optionally with query e.g. "is:unread")
 */
export async function listMessages(query = "") {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 10,
  });
  console.log("List messages:", res.data.messages);
  return res.data.messages || [];
}

/**
 * Get full message content
 */
export async function getMessage(messageId) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full", // can be 'metadata' or 'minimal'
  });
  console.log("Message:", res.data);
  return res.data;
}

/**
 * Modify message (e.g. mark read/unread, apply label)
 */
export async function modifyMessage(messageId, labelsToAdd = [], labelsToRemove = []) {
  const res = await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: labelsToAdd,
      removeLabelIds: labelsToRemove,
    },
  });
  return res.data;
}

/**
 * List all labels
 */
export async function listLabels() {
  const res = await gmail.users.labels.list({ userId: "me" });
  return res.data.labels || [];
}

/**
 * Get a thread (all messages in conversation)
 */
export async function getThread(threadId) {
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
}

/**
 * Get mailbox history since a given historyId (for syncing)
 */
export async function getHistory(startHistoryId) {
  const res = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
    historyTypes: ["messageAdded", "messageDeleted"],
  });
  return res.data.history || [];
}

/**
 * Sync Gmail inbox emails to database
 */
export async function syncInboxEmails(userId, maxResults = 50) {
  try {
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
        const emailData = extractEmailData(payload, fullMessage, userId);
        
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
function extractEmailData(payload, fullMessage, userId) {
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
      metadata: {
        gmailMessageId: fullMessage.id,
        threadId: fullMessage.threadId,
        labels: fullMessage.labelIds || [],
        gmailLabels: fullMessage.labelIds || [],
        isRead: !fullMessage.labelIds?.includes('UNREAD'),
        isStarred: fullMessage.labelIds?.includes('STARRED') || false,
        isImportant: fullMessage.labelIds?.includes('IMPORTANT') || false,
        receivedDate: new Date(date),
        emailDirection: 'received'
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


// listMessages();
// getMessage("19951abd82bd7f55");
// getThread("19951abd82bd7f55");