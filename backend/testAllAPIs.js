import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';
let authToken = '';

// Test 1: User Registration
async function testUserRegistration() {
  console.log('🧪 Testing User Registration...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@melnitz.com',
        password: 'test123',
        phone: '1234567890',
        address: '123 Test St',
        answer: 'test',
        role: '64f4a1b2c3d4e5f6a7b8c9d0' // You'll need to get a real role ID
      })
    });

    const data = await response.json();
    console.log('✅ Registration Response:', data);
    
    if (data.success) {
      console.log('🎉 User registered successfully!');
    } else {
      console.log('⚠️ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
  }
}

// Test 2: User Login
async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@melnitz.com',
        password: 'test123'
      })
    });

    const data = await response.json();
    console.log('✅ Login Response:', data);
    
    if (data.success && data.token) {
      authToken = data.token;
      console.log('🎉 Login successful! Token received.');
    } else {
      console.log('⚠️ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
}

// Test 3: Initialize AI Assistant
async function testInitializeAI() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n🤖 Testing AI Assistant Initialization...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    console.log('✅ AI Initialization Response:', data);
  } catch (error) {
    console.error('❌ AI Initialization error:', error.message);
  }
}

// Test 4: Generate Personalized Email
async function testGenerateEmail() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n📧 Testing Email Generation...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/generate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        contactId: '64f4a1b2c3d4e5f6a7b8c9d1', // You'll need a real contact ID
        emailType: 'followup',
        context: 'Sales follow-up for luxury property'
      })
    });

    const data = await response.json();
    console.log('✅ Email Generation Response:', data);
  } catch (error) {
    console.error('❌ Email Generation error:', error.message);
  }
}

// Test 5: Summarize Meeting Notes
async function testSummarizeNotes() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n📝 Testing Meeting Notes Summarization...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/summarize-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        notes: 'Meeting discussed Q4 sales strategy. Key points: 1) Focus on luxury segment 2) Increase follow-up frequency 3) New marketing campaign needed 4) Budget allocation approved',
        context: 'Sales team quarterly meeting'
      })
    });

    const data = await response.json();
    console.log('✅ Notes Summarization Response:', data);
  } catch (error) {
    console.error('❌ Notes Summarization error:', error.message);
  }
}

// Test 6: Process Dictation
async function testProcessDictation() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n🎤 Testing Dictation Processing...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/process-dictation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        audioText: 'We need to schedule a follow-up call with the client next week to discuss the property details and pricing options',
        context: 'Voice memo from client meeting'
      })
    });

    const data = await response.json();
    console.log('✅ Dictation Processing Response:', data);
  } catch (error) {
    console.error('❌ Dictation Processing error:', error.message);
  }
}

// Test 7: Custom AI Prompt
async function testCustomPrompt() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n🤖 Testing Custom AI Prompt...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/custom-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        prompt: 'Create a professional sales pitch for a luxury real estate client who is looking for properties in the $2-5 million range',
        context: 'Luxury property sales pitch'
      })
    });

    const data = await response.json();
    console.log('✅ Custom Prompt Response:', data);
  } catch (error) {
    console.error('❌ Custom Prompt error:', error.message);
  }
}

// Test 8: Get Analytics
async function testGetAnalytics() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n📊 Testing Analytics Retrieval...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    console.log('✅ Analytics Response:', data);
  } catch (error) {
    console.error('❌ Analytics error:', error.message);
  }
}

// Test 9: Get Interaction History
async function testGetHistory() {
  if (!authToken) {
    console.log('⚠️ Skipping AI tests - no auth token');
    return;
  }

  console.log('\n📚 Testing Interaction History...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-assistant/interactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    console.log('✅ History Response:', data);
  } catch (error) {
    console.error('❌ History error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete API Testing...\n');
  
  await testUserRegistration();
  await testUserLogin();
  await testInitializeAI();
  await testGenerateEmail();
  await testSummarizeNotes();
  await testProcessDictation();
  await testCustomPrompt();
  await testGetAnalytics();
  await testGetHistory();
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
