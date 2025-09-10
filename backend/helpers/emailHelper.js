import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

export async function sendEmail(to, subject, text) {
  try {
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
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("✅ Email sent, ID:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}

// quick test
sendEmail("kazmizain258@gmail.com", "Test Gmail API", "This was sent without SMTP!");