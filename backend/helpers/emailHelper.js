import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Hardcoded Google OAuth credentials
const oAuth2Client = new google.auth.OAuth2(
  "533043152880-e68i6d56n9gd7hvb3d0t8krhmt8sh280.apps.googleusercontent.com",
  "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",
  "https://developers.google.com/oauthplayground"
);

// Attach hardcoded refresh token
oAuth2Client.setCredentials({ 
  refresh_token: "1//04C8A4KmF4ijUCgYIARAAGAQSNwF-L9IrNeIbAcgrfuYgKCfakCr46FMcy-mhNJFedagGElq014k5DKGEEOYjIPFKWPQQataZpOs"
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

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
