import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getActiveEmailAccount, getGmailClient } from '../helpers/emailHelper.js';

dotenv.config();

class GoogleCalendarService {
    constructor() {
        // Google OAuth credentials (still from env for client setup)
        this.oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        
        this.calendar = null; // Will be initialized when needed
        this.emailTransporter = null; // Will be initialized when needed
    }

    // Method to get configured calendar client with active account tokens
    async getCalendarClient() {
        try {
            const activeAccount = await getActiveEmailAccount();
            
            // Set credentials for the active account
            this.oAuth2Client.setCredentials({
                refresh_token: activeAccount.google.refreshToken,
                access_token: activeAccount.google.accessToken,
                expiry_date: activeAccount.google.expiryDate
            });

            this.calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
            return this.calendar;
        } catch (error) {
            console.error('Error setting up Calendar client:', error);
            throw error;
        }
    }

    async getEmailTransporter() {
        if (!this.emailTransporter) {
            await this.setupEmailTransporter();
        }
        return this.emailTransporter;
    }

    async setupEmailTransporter() {
        try {
            const activeAccount = await getActiveEmailAccount();
            
            this.emailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: activeAccount.email,
                    pass: 'your_app_password_here' // You'll need to add your Gmail app password here
                }
            });
        } catch (error) {
            console.error('Error setting up email transporter:', error);
            // Fallback to hardcoded values if no active account
            this.emailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'zainkazmi258@gmail.com', // Hardcoded email
                    pass: 'your_app_password_here' // You'll need to add your Gmail app password here
                }
            });
        }
    }

    // Check if we have valid credentials (refresh token)
    async hasValidCredentials() {
        try {
            // Get calendar client with active account tokens
            await this.getCalendarClient();
            
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
            // Get calendar client with active account tokens
            const calendar = await this.getCalendarClient();
            
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

            const response = await calendar.events.insert({
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
            // Get calendar client with active account tokens
            const calendar = await this.getCalendarClient();
            
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

            const response = await calendar.events.update({
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
            // Get calendar client with active account tokens
            const calendar = await this.getCalendarClient();
            
            await calendar.events.delete({
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
            // Get email transporter with active account
            const emailTransporter = await this.getEmailTransporter();
            
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

            // Get active account for the from email
            const activeAccount = await getActiveEmailAccount();
            
            const mailOptions = {
                from: activeAccount.email,
                to: attendees.join(', '),
                subject: `Meeting Invitation: ${title}`,
                html: emailContent
            };

            await emailTransporter.sendMail(mailOptions);
            
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
