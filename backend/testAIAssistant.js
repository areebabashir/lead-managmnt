import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Test Gemini API connection
async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.log('Please add GEMINI_API_KEY=AIzaSyD5sDQfbiA0Q3VMRUOC-1FXbxrrO4aRiW4 to your .env file');
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('✅ Gemini API initialized successfully');
    
    // Test a simple prompt
    console.log('\nTesting simple prompt...');
    const result = await model.generateContent('Hello! Please respond with "Gemini API is working correctly."');
    const response = result.response.text();
    
    console.log('✅ API Response:', response);
    console.log('\n🎉 Gemini API integration is working correctly!');
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('The API key appears to be invalid. Please check your Gemini API key.');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('API quota exceeded. Please check your Gemini API usage limits.');
    } else {
      console.log('Please check your internet connection and API key configuration.');
    }
  }
}

// Test AI Assistant models
async function testModels() {
  try {
    console.log('\nTesting AI Assistant models...');
    
    // Import models
    const { AIInteraction, AIPromptCache, AIAssistant } = await import('./models/aiAssistantModel.js');
    
    console.log('✅ AI Assistant models imported successfully');
    console.log('Available models:');
    console.log('- AIInteraction');
    console.log('- AIPromptCache');
    console.log('- AIAssistant');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  }
}

// Test Gemini service
async function testGeminiService() {
  try {
    console.log('\nTesting Gemini service...');
    
    // Import service
    const geminiService = await import('./services/geminiService.js');
    
    console.log('✅ Gemini service imported successfully');
    console.log('Available methods:');
    console.log('- generatePersonalizedEmail');
    console.log('- suggestFollowUpTime');
    console.log('- summarizeMeetingNotes');
    console.log('- processDictation');
    console.log('- processCustomPrompt');
    
  } catch (error) {
    console.error('❌ Service test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing AI Assistant Integration...\n');
  
  await testGeminiAPI();
  await testModels();
  await testGeminiService();
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runTests().catch(console.error);
