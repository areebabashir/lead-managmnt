// calendarservice.js
import { google } from "googleapis";
import dotenv from "dotenv";
import { getActiveEmailAccount } from "./emailHelper.js";

dotenv.config();

//import the credentials from env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Hardcoded Google Calendar credentials
// const CLIENT_ID = "533043152880-e68i6d56n9gd7hvb3d0t8krhmt8sh280.apps.googleusercontent.com";
// const CLIENT_SECRET = "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";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN = "1//04C8A4KmF4ijUCgYIARAAGAQSNwF-L9IrNeIbAcgrfuYgKCfakCr46FMcy-mhNJFedagGElq014k5DKGEEOYjIPFKWPQQataZpOs";

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "✅ Loaded" : "❌ Missing");


async function checkCalendarConnection() {
  try {
    // Get active email account
    const activeAccount = await getActiveEmailAccount();
    
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Set credentials from active account
    oAuth2Client.setCredentials({ 
      refresh_token: activeAccount.google.refreshToken,
      access_token: activeAccount.google.accessToken,
      expiry_date: activeAccount.google.expiryDate
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Just try to list calendar entries
    const res = await calendar.calendarList.list();
    console.log("✅ Connected to Google Calendar!");
    console.log(`📧 Using account: ${activeAccount.email}`);
    res.data.items.forEach((cal) =>
      console.log(`📅 ${cal.summary} (${cal.id})`)
    );
  } catch (err) {
    console.error("❌ Google Calendar connection failed:", err.message);
  }
}

checkCalendarConnection();
