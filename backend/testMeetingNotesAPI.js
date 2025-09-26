import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const API_BASE_URL = 'http://localhost:8000/api';

// Test configuration
const testConfig = {
    // You'll need to get a valid JWT token from login
    authToken: 'YOUR_JWT_TOKEN_HERE',
    audioFilePath: './helpers/sample.wav' // Make sure this file exists
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, isFormData = false) => {
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${testConfig.authToken}`,
            }
        };

        if (data) {
            if (isFormData) {
                config.data = data;
                // Don't set Content-Type, let axios handle it for FormData
            } else {
                config.data = data;
                config.headers['Content-Type'] = 'application/json';
            }
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
};

// Test functions
const testGenerateTranscript = async () => {
    console.log('\n🎵 Testing Generate Transcript...');
    
    if (!fs.existsSync(testConfig.audioFilePath)) {
        console.log('❌ Audio file not found:', testConfig.audioFilePath);
        return null;
    }

    const formData = new FormData();
    formData.append('audioFile', fs.createReadStream(testConfig.audioFilePath));
    formData.append('languageCode', 'en-US');

    const result = await makeRequest('POST', '/meeting-notes/transcript', formData, true);
    
    if (result.success) {
        console.log('✅ Transcript generated successfully');
        console.log('Transcript:', result.data.data.transcript);
        return result.data.data;
    } else {
        console.log('❌ Transcript generation failed:', result.error);
        return null;
    }
};

const testGenerateSummary = async (transcriptData) => {
    console.log('\n📝 Testing Generate Summary...');
    
    if (!transcriptData) {
        console.log('❌ No transcript data available');
        return null;
    }

    const summaryData = {
        transcript: transcriptData.transcript,
        meetingTitle: 'Test Meeting',
        participants: ['John Doe', 'Jane Smith'],
        duration: transcriptData.duration,
        confidence: transcriptData.confidence
    };

    const result = await makeRequest('POST', '/meeting-notes/summary', summaryData);
    
    if (result.success) {
        console.log('✅ Summary generated successfully');
        console.log('Summary:', result.data.data.summary.substring(0, 200) + '...');
        return result.data.data;
    } else {
        console.log('❌ Summary generation failed:', result.error);
        return null;
    }
};

const testCreateMeetingNote = async (transcriptData, summaryData) => {
    console.log('\n💾 Testing Create Meeting Note...');
    
    if (!transcriptData) {
        console.log('❌ No transcript data available');
        return null;
    }

    const meetingNoteData = {
        meetingTitle: 'Test Meeting - API Testing',
        meetingDate: new Date().toISOString(),
        participants: [
            { name: 'John Doe', email: 'john@example.com', type: 'simple' },
            { name: 'Jane Smith', type: 'simple' }
        ],
        audioFileUrl: transcriptData.audioFileUrl,
        audioFileName: transcriptData.audioFileName,
        audioFileSize: transcriptData.audioFileSize,
        transcription: transcriptData.transcript,
        rawTranscriptData: transcriptData.rawTranscriptData,
        summary: summaryData?.summary || '',
        duration: transcriptData.duration,
        confidence: transcriptData.confidence,
        tags: ['test', 'api-testing'],
        category: 'testing'
    };

    const result = await makeRequest('POST', '/meeting-notes', meetingNoteData);
    
    if (result.success) {
        console.log('✅ Meeting note created successfully');
        console.log('Meeting Note ID:', result.data.data._id);
        return result.data.data;
    } else {
        console.log('❌ Meeting note creation failed:', result.error);
        return null;
    }
};

const testGetMeetingNotes = async () => {
    console.log('\n📋 Testing Get Meeting Notes...');
    
    const result = await makeRequest('GET', '/meeting-notes?limit=5');
    
    if (result.success) {
        console.log('✅ Meeting notes retrieved successfully');
        console.log('Total notes:', result.data.pagination?.totalCount || 0);
        console.log('Retrieved:', result.data.data.length);
        return result.data.data;
    } else {
        console.log('❌ Get meeting notes failed:', result.error);
        return null;
    }
};

const testGetMeetingNote = async (meetingNoteId) => {
    console.log('\n🔍 Testing Get Single Meeting Note...');
    
    if (!meetingNoteId) {
        console.log('❌ No meeting note ID available');
        return null;
    }

    const result = await makeRequest('GET', `/meeting-notes/${meetingNoteId}`);
    
    if (result.success) {
        console.log('✅ Meeting note retrieved successfully');
        console.log('Title:', result.data.data.meetingTitle);
        return result.data.data;
    } else {
        console.log('❌ Get meeting note failed:', result.error);
        return null;
    }
};

const testUpdateMeetingNote = async (meetingNoteId) => {
    console.log('\n✏️ Testing Update Meeting Note...');
    
    if (!meetingNoteId) {
        console.log('❌ No meeting note ID available');
        return null;
    }

    const updateData = {
        meetingTitle: 'Updated Test Meeting - API Testing',
        tags: ['test', 'api-testing', 'updated']
    };

    const result = await makeRequest('PUT', `/meeting-notes/${meetingNoteId}`, updateData);
    
    if (result.success) {
        console.log('✅ Meeting note updated successfully');
        console.log('Updated title:', result.data.data.meetingTitle);
        return result.data.data;
    } else {
        console.log('❌ Update meeting note failed:', result.error);
        return null;
    }
};

const testGetMeetingNotesStats = async () => {
    console.log('\n📊 Testing Get Meeting Notes Stats...');
    
    const result = await makeRequest('GET', '/meeting-notes/stats');
    
    if (result.success) {
        console.log('✅ Meeting notes stats retrieved successfully');
        console.log('Stats:', result.data.data);
        return result.data.data;
    } else {
        console.log('❌ Get meeting notes stats failed:', result.error);
        return null;
    }
};

// Main test function
const runTests = async () => {
    console.log('🚀 Starting Meeting Notes API Tests...');
    
    // Check if auth token is set
    if (testConfig.authToken === 'YOUR_JWT_TOKEN_HERE') {
        console.log('❌ Please set a valid JWT token in testConfig.authToken');
        console.log('You can get a token by logging in through the /api/auth/login endpoint');
        return;
    }

    try {
        // Test transcript generation
        const transcriptData = await testGenerateTranscript();
        
        // Test summary generation
        const summaryData = await testGenerateSummary(transcriptData);
        
        // Test create meeting note
        const meetingNote = await testCreateMeetingNote(transcriptData, summaryData);
        
        // Test get all meeting notes
        await testGetMeetingNotes();
        
        // Test get single meeting note
        await testGetMeetingNote(meetingNote?._id);
        
        // Test update meeting note
        await testUpdateMeetingNote(meetingNote?._id);
        
        // Test get stats
        await testGetMeetingNotesStats();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { runTests, testConfig };

