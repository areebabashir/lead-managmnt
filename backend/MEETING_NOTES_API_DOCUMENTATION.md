# Meeting Notes API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meeting-notes/transcript` | Generate transcript from audio |
| POST | `/meeting-notes/summary` | Generate AI summary from transcript |
| POST | `/meeting-notes` | Create meeting note |
| GET | `/meeting-notes` | Get all meeting notes |
| GET | `/meeting-notes/stats` | Get meeting notes statistics |
| GET | `/meeting-notes/:id` | Get specific meeting note |
| PUT | `/meeting-notes/:id` | Update meeting note |
| DELETE | `/meeting-notes/:id` | Delete meeting note |

---

## 1. Generate Transcript

**POST** `/meeting-notes/transcript`

Upload an audio file and generate transcript using Google Speech-to-Text.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
audioFile: [WAV file] (required)
languageCode: "en-US" (optional, defaults to en-US)
```

### Response
```json
{
  "success": true,
  "message": "Transcript generated successfully",
  "data": {
    "audioFileUrl": "audiiofiles/audioFile-1642567890123-456789.wav",
    "audioFileName": "meeting-recording.wav",
    "audioFileSize": 2048576,
    "transcript": "okay uh the recording is started then please uh present the email configuration",
    "confidence": 0.78622705,
    "duration": "10s",
    "segments": [
      {
        "text": "okay uh the recording is started",
        "confidence": 0.78622705,
        "endTime": "5.940s"
      }
    ],
    "rawTranscriptData": {
      "results": [...],
      "totalBilledTime": "10s",
      "requestId": "3964155604961091904"
    }
  }
}
```

### Error Responses
- **400**: Audio file is required
- **403**: Permission denied
- **500**: Failed to generate transcript

---

## 2. Generate Summary

**POST** `/meeting-notes/summary`

Generate AI-powered summary from meeting transcript using Gemini AI.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "transcript": "okay uh the recording is started then please uh present the email configuration. We discussed the SMTP settings and OAuth2 implementation...",
  "meetingTitle": "Email Configuration Meeting",
  "participants": ["John Doe", "Sarah Smith", "Mike Johnson"],
  "duration": "15m",
  "confidence": 0.85
}
```

### Response
```json
{
  "success": true,
  "message": "Summary generated successfully",
  "data": {
    "summary": "## Meeting Overview\nThis meeting focused on email configuration setup, specifically discussing SMTP settings and OAuth2 implementation for the system.\n\n## Key Discussion Points\n- SMTP configuration requirements\n- OAuth2 authentication setup\n- Task assignments for frontend and backend development\n- Project timeline and deadlines\n\n## Action Items\n- John Doe: Handle frontend integration\n- Sarah Smith: Work on backend API endpoints\n- Complete implementation by Friday\n\n## Important Decisions\n- Proceed with OAuth2 implementation\n- Divide work between frontend and backend teams\n\n## Next Steps\n- Begin development work immediately\n- Schedule follow-up meeting for progress review",
    "isCached": false
  }
}
```

### Error Responses
- **400**: Transcript is required
- **403**: Permission denied
- **500**: Failed to generate summary

---

## 3. Create Meeting Note

**POST** `/meeting-notes`

Create a new meeting note with all details.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "meetingTitle": "Email Configuration Meeting",
  "meetingDate": "2024-01-15T10:00:00.000Z",
  "participants": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "type": "simple"
    },
    {
      "name": "Sarah Smith",
      "type": "simple"
    },
    {
      "contactId": "contact_object_id_here",
      "type": "contact"
    }
  ],
  "audioFileUrl": "audiiofiles/audioFile-1642567890123-456789.wav",
  "audioFileName": "meeting-recording.wav",
  "audioFileSize": 2048576,
  "transcription": "okay uh the recording is started then please uh present the email configuration...",
  "rawTranscriptData": {
    "results": [...],
    "totalBilledTime": "10s"
  },
  "summary": "## Meeting Overview\nThis meeting focused on email configuration setup...",
  "duration": "15m",
  "confidence": 0.85,
  "tags": ["email", "configuration", "development"],
  "category": "technical"
}
```

### Participants Field Options
1. **Simple Participant** (name/email input):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "type": "simple"
   }
   ```

2. **Contact Reference** (from contacts database):
   ```json
   {
     "contactId": "contact_object_id_here",
     "type": "contact"
   }
   ```

### Response
```json
{
  "success": true,
  "message": "Meeting note created successfully",
  "data": {
    "_id": "meeting_note_id",
    "meetingTitle": "Email Configuration Meeting",
    "meetingDate": "2024-01-15T10:00:00.000Z",
    "participants": [...],
    "audioFileUrl": "audiiofiles/audioFile-1642567890123-456789.wav",
    "transcription": "okay uh the recording is started...",
    "summary": "## Meeting Overview...",
    "transcriptionStatus": "completed",
    "summaryStatus": "completed",
    "tags": ["email", "configuration"],
    "category": "technical",
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses
- **400**: Meeting title, date, and audio file URL are required
- **403**: Permission denied
- **500**: Error creating meeting note

---

## 4. Get All Meeting Notes

**GET** `/meeting-notes`

Get all meeting notes with pagination, search, and filtering.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `search` | string | Search in title, transcript, or summary | - |
| `category` | string | Filter by category | - |
| `tags` | string | Filter by tags (comma-separated) | - |
| `dateFrom` | string | Start date filter (ISO format) | - |
| `dateTo` | string | End date filter (ISO format) | - |
| `sortBy` | string | Sort field | meetingDate |
| `sortOrder` | string | Sort order: asc or desc | desc |

### Example Request
```
GET /meeting-notes?page=1&limit=10&search=email&category=technical&tags=development,email&dateFrom=2024-01-01&dateTo=2024-01-31&sortBy=meetingDate&sortOrder=desc
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "meeting_note_id",
      "meetingTitle": "Email Configuration Meeting",
      "meetingDate": "2024-01-15T10:00:00.000Z",
      "participants": [...],
      "transcriptionStatus": "completed",
      "summaryStatus": "completed",
      "tags": ["email", "configuration"],
      "category": "technical",
      "createdBy": {
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 5. Get Meeting Note by ID

**GET** `/meeting-notes/:id`

Get a specific meeting note by ID.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Meeting note ID |

### Response
```json
{
  "success": true,
  "data": {
    "_id": "meeting_note_id",
    "meetingTitle": "Email Configuration Meeting",
    "meetingDate": "2024-01-15T10:00:00.000Z",
    "participants": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "type": "simple"
      },
      {
        "contactId": {
          "_id": "contact_id",
          "fullName": "Sarah Smith",
          "email": "sarah@company.com",
          "company": "Tech Corp"
        },
        "type": "contact"
      }
    ],
    "audioFileUrl": "audiiofiles/audioFile-1642567890123-456789.wav",
    "audioFileName": "meeting-recording.wav",
    "audioFileSize": 2048576,
    "transcription": "Full meeting transcript here...",
    "summary": "Complete meeting summary here...",
    "rawTranscriptData": {...},
    "duration": "15m",
    "confidence": 0.85,
    "transcriptionStatus": "completed",
    "summaryStatus": "completed",
    "tags": ["email", "configuration", "development"],
    "category": "technical",
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses
- **404**: Meeting note not found
- **403**: Permission denied

---

## 6. Update Meeting Note

**PUT** `/meeting-notes/:id`

Update an existing meeting note.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Meeting note ID |

### Request Body
```json
{
  "meetingTitle": "Updated Email Configuration Meeting",
  "meetingDate": "2024-01-15T10:00:00.000Z",
  "participants": [
    {
      "name": "John Doe Updated",
      "email": "john.updated@example.com",
      "type": "simple"
    },
    {
      "name": "New Participant",
      "type": "simple"
    }
  ],
  "transcription": "Updated transcript content here...",
  "summary": "Updated summary content here...",
  "tags": ["email", "configuration", "development", "updated"],
  "category": "technical-updated"
}
```

### Response
```json
{
  "success": true,
  "message": "Meeting note updated successfully",
  "data": {
    "_id": "meeting_note_id",
    "meetingTitle": "Updated Email Configuration Meeting",
    "meetingDate": "2024-01-15T10:00:00.000Z",
    "participants": [...],
    "transcription": "Updated transcript...",
    "summary": "Updated summary...",
    "tags": ["email", "configuration", "updated"],
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "updatedBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Error Responses
- **404**: Meeting note not found
- **403**: Permission denied
- **500**: Error updating meeting note

---

## 7. Delete Meeting Note

**DELETE** `/meeting-notes/:id`

Delete a meeting note (soft delete - sets isActive to false).

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Meeting note ID |

### Response
```json
{
  "success": true,
  "message": "Meeting note deleted successfully"
}
```

### Error Responses
- **404**: Meeting note not found
- **403**: Permission denied
- **500**: Error deleting meeting note

---

## 8. Get Meeting Notes Statistics

**GET** `/meeting-notes/stats`

Get meeting notes statistics for the current user.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "success": true,
  "data": {
    "totalNotes": 47,
    "recentNotes": 12,
    "processingNotes": 2,
    "categoryStats": [
      {
        "_id": "technical",
        "count": 15
      },
      {
        "_id": "business",
        "count": 20
      },
      {
        "_id": "planning",
        "count": 12
      }
    ],
    "monthlyStats": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "count": 15
      },
      {
        "_id": {
          "year": 2023,
          "month": 12
        },
        "count": 18
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Permissions Required

All endpoints require specific permissions:

- **Transcript Generation**: `meeting_notes:create`
- **Summary Generation**: `meeting_notes:create`
- **Create Meeting Note**: `meeting_notes:create`
- **Read Operations**: `meeting_notes:read`
- **Update Operations**: `meeting_notes:update`
- **Delete Operations**: `meeting_notes:delete`

---

## File Upload Specifications

### Audio File Requirements
- **Format**: WAV only
- **Size Limit**: 50MB
- **Processing**: Automatically converted to mono 16kHz format
- **Storage**: Files saved to `audiiofiles/` directory

### File Naming Convention
```
audioFile-{timestamp}-{random}.wav
Example: audioFile-1642567890123-456789.wav
```

---

## Workflow Example

1. **Upload Audio & Generate Transcript**:
   ```bash
   POST /meeting-notes/transcript
   # Upload WAV file, get transcript data
   ```

2. **Generate Summary** (Optional):
   ```bash
   POST /meeting-notes/summary
   # Send transcript, get AI summary
   ```

3. **User Edits Transcript** (Frontend):
   ```
   # User reviews and edits transcript in UI
   ```

4. **Save Meeting Note**:
   ```bash
   POST /meeting-notes
   # Save complete meeting note with edited transcript
   ```

This workflow ensures that the meeting note is only saved when the user explicitly clicks "Save" after reviewing and editing the transcript.

