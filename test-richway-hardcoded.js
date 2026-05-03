const axios = require('axios');

async function testRichwayConnection() {
  const email = 'worldaim@gmail.com';
  const password = 'admin123';
  const loginUrl = 'https://rw-ghhg.onrender.com/api/external/verify-login';
  const secret = '3e7c8b0e9f64db2a5fcc19ab3f518b5de98c2534f3b7239a58b8d4e73fca91b3';

  console.log('Testing Richway Login...');
  console.log('URL:', loginUrl);
  console.log('Secret:', secret);

  try {
    const response = await axios.post(loginUrl, {
      email,
      password,
      secret
    }, { timeout: 10000 });

    console.log('SUCCESS:', response.data);
  } catch (err) {
    console.error('FAILED:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
  }
}

testRichwayConnection();
