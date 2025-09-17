// calendarservice.js
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

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
