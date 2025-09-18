import { google } from 'googleapis';
import nodemailer from 'nodemailer';

class GoogleCalendarService {
    constructor() {
        // Hardcoded Google Calendar credentials
        this.oAuth2Client = new google.auth.OAuth2(
            "533043152880-e68i6d56n9gd7hvb3d0t8krhmt8sh280.apps.googleusercontent.com",
            "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",
            "https://developers.google.com/oauthplayground"
        );
        
        // Set hardcoded refresh token
        console.log('Setting Google Calendar refresh token...');
        this.oAuth2Client.setCredentials({
            refresh_token: "1//04C8A4KmF4ijUCgYIARAAGAQSNwF-L9IrNeIbAcgrfuYgKCfakCr46FMcy-mhNJFedagGElq014k5DKGEEOYjIPFKWPQQataZpOs"
        });
        
        this.calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
        this.setupEmailTransporter();
    }

    setupEmailTransporter() {
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'zainkazmi258@gmail.com', // Hardcoded email
                pass: 'your_app_password_here' // You'll need to add your Gmail app password here
            }
        });
    }

    // Check if we have valid credentials (refresh token)
    async hasValidCredentials() {
        try {
            // Try to refresh the access token to verify credentials
            const { credentials } = await this.oAuth2Client.refreshAccessToken();
            console.log('✅ Google Calendar credentials are valid');
            return true;
        } catch (error) {
            console.error('❌ Google Calendar credentials invalid:', error.message);
            return false;
        }
    }

    // Create a Google Calendar event with Google Meet link
    async createCalendarEvent(meetingData, userEmail) {
        try {
            const { title, description, date, startTime, endTime, attendees = [] } = meetingData;
            
            // Convert date and time to ISO format
            const startDateTime = new Date(`${date}T${startTime}:00`);
            const endDateTime = new Date(`${date}T${endTime}:00`);
            
            const event = {
                summary: title,
                description: description || '',
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'UTC',
                },
                attendees: [
                    { email: userEmail },
                    ...attendees.map(email => ({ email }))
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet'
                        }
                    }
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 10 }, // 10 minutes before
                    ],
                },
            };

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                conferenceDataVersion: 1,
                sendUpdates: 'all'
            });

            return {
                success: true,
                eventId: response.data.id,
                meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
                eventLink: response.data.htmlLink,
                data: response.data
            };

        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update a Google Calendar event
    async updateCalendarEvent(eventId, meetingData, userEmail) {
        try {
            const { title, description, date, startTime, endTime, attendees = [] } = meetingData;
            
            // Convert date and time to ISO format
            const startDateTime = new Date(`${date}T${startTime}:00`);
            const endDateTime = new Date(`${date}T${endTime}:00`);
            
            const event = {
                summary: title,
                description: description || '',
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'UTC',
                },
                attendees: [
                    { email: userEmail },
                    ...attendees.map(email => ({ email }))
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 10 }, // 10 minutes before
                    ],
                },
            };

            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
                sendUpdates: 'all'
            });

            return {
                success: true,
                eventId: response.data.id,
                meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
                eventLink: response.data.htmlLink,
                data: response.data
            };

        } catch (error) {
            console.error('Error updating Google Calendar event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete a Google Calendar event
    async deleteCalendarEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all'
            });

            return {
                success: true,
                message: 'Event deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting Google Calendar event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send meeting invitation email
    async sendMeetingInvitation(meetingData, meetLink, eventLink, attendees) {
        try {
            const { title, description, date, startTime, endTime, location } = meetingData;
            
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1976d2;">📅 Meeting Invitation</h2>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">${title}</h3>
                        
                        <p><strong>📅 Date:</strong> ${date}</p>
                        <p><strong>🕐 Time:</strong> ${startTime} - ${endTime}</p>
                        ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
                        ${meetingData.hostName ? `<p><strong>👤 Host:</strong> ${meetingData.hostName}</p>` : ''}
                        ${meetingData.guestNames && meetingData.guestNames.length > 0 ? `<p><strong>👥 Guests:</strong> ${meetingData.guestNames.join(', ')}</p>` : ''}
                        ${description ? `<p><strong>📝 Description:</strong> ${description}</p>` : ''}
                    </div>
                    
                    ${meetLink ? `
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="color: #1976d2; margin-top: 0;">🎥 Join Google Meet</h3>
                        <a href="${meetLink}" 
                           style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                            Join Meeting
                        </a>
                    </div>
                    ` : ''}
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            📋 <a href="${eventLink}" style="color: #1976d2;">View in Google Calendar</a>
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        This meeting was created through Melnitz AI Sales Assistant.
                    </p>
                </div>
            `;

            const mailOptions = {
                from: 'zainkazmi258@gmail.com',
                to: attendees.join(', '),
                subject: `Meeting Invitation: ${title}`,
                html: emailContent
            };

            await this.emailTransporter.sendMail(mailOptions);
            
            return {
                success: true,
                message: 'Meeting invitation sent successfully'
            };

        } catch (error) {
            console.error('Error sending meeting invitation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get authorization URL for OAuth
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/oauth2callback'
        });
    }

    // Exchange authorization code for tokens
    async getTokens(code) {
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            this.oAuth2Client.setCredentials(tokens);
            return {
                success: true,
                tokens
            };
        } catch (error) {
            console.error('Error getting tokens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new GoogleCalendarService();
