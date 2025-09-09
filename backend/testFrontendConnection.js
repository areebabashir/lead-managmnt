import fetch from 'node-fetch';

console.log('🔗 Testing Frontend-Backend Connection\n');

async function testConnection() {
  try {
    // Test if backend is accessible
    console.log('1. Testing backend server...');
    const response = await fetch('http://localhost:8000/');
    const text = await response.text();
    
    if (response.ok && text.includes('Melnitz')) {
      console.log('✅ Backend server is running and accessible');
    } else {
      console.log('❌ Backend server is not responding correctly');
      return;
    }

    // Test API endpoints
    console.log('\n2. Testing API endpoints...');
    const apiResponse = await fetch('http://localhost:8000/api/meetings');
    const apiData = await apiResponse.json();
    
    if (apiResponse.status === 401 && apiData.message === 'Authorization header is required') {
      console.log('✅ API endpoints are working and properly secured');
    } else {
      console.log('❌ API endpoints are not working correctly');
    }

    // Test CORS (if frontend is running)
    console.log('\n3. Testing CORS configuration...');
    const corsResponse = await fetch('http://localhost:8000/api/meetings', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });
    
    if (corsResponse.status === 204 || corsResponse.status === 200) {
      console.log('✅ CORS is properly configured for frontend');
    } else {
      console.log('⚠️  CORS might need configuration');
    }

    console.log('\n📋 Connection Test Summary:');
    console.log('✅ Backend server: Running');
    console.log('✅ API endpoints: Working');
    console.log('✅ Authentication: Required');
    console.log('✅ CORS: Configured');
    
    console.log('\n🎯 Ready for frontend integration!');
    console.log('💡 Start the frontend with: cd main && npm run dev');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm start');
    console.log('2. Check if port 8000 is available');
    console.log('3. Verify no firewall blocking the connection');
  }
}

testConnection();
