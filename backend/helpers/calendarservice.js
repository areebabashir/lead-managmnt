// calendarservice.js
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Hardcoded Google Calendar credentials
const CLIENT_ID = "533043152880-e68i6d56n9gd7hvb3d0t8krhmt8sh280.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04C8A4KmF4ijUCgYIARAAGAQSNwF-L9IrNeIbAcgrfuYgKCfakCr46FMcy-mhNJFedagGElq014k5DKGEEOYjIPFKWPQQataZpOs";

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("REFRESH_TOKEN:", REFRESH_TOKEN ? "✅ Loaded" : "❌ Missing");


async function checkCalendarConnection() {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Set credentials (VERY important!)
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Just try to list calendar entries
    const res = await calendar.calendarList.list();
    console.log("✅ Connected to Google Calendar!");
    res.data.items.forEach((cal) =>
      console.log(`📅 ${cal.summary} (${cal.id})`)
    );
  } catch (err) {
    console.error("❌ Google Calendar connection failed:", err.message);
  }
}

checkCalendarConnection();
