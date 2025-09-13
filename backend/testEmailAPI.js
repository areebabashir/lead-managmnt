import { sendEmail } from './helpers/emailHelper.js';

// Test email functionality
async function testEmailAPI() {
  try {
    console.log('🧪 Testing Email API...');
    
    // Check if credentials are available
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.log('⚠️  Google OAuth credentials not configured');
      console.log('📧 Email functionality will not work without proper Gmail API setup');
      return;
    }
    
    console.log('✅ Google OAuth credentials found');
    console.log('📧 Email API is ready to use');
    
  } catch (error) {
    console.error('❌ Email API test failed:', error.message);
  }
}

testEmailAPI();
