import mongoose from 'mongoose';
import Email from './models/emailModel.js';
import emailScheduler from './services/emailScheduler.js';
import User from './models/authModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSendNow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test email
    const testEmail = await Email.findOne({ status: 'draft' });
    
    if (!testEmail) {
      console.log('❌ No draft email found for testing');
      return;
    }

    console.log(`📧 Testing send now with email: ${testEmail._id}`);
    console.log(`📧 Current status: ${testEmail.status}`);

    // Test send now functionality
    const result = await emailScheduler.sendEmailNow(testEmail._id);
    
    console.log('✅ Send now test completed successfully');
    console.log(`📧 New status: ${result.status}`);
    
  } catch (error) {
    console.error('❌ Send now test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSendNow();
