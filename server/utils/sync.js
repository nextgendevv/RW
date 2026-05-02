const axios = require('axios');

/**
 * Sync user to the partner streaming service (NetX)
 * @param {string} userEmail 
 * @param {string} userName 
 */
async function syncToNetX(userEmail, userName) {
  try {
    const streamUrl = process.env.STREAMING_SITE_URL || 'https://netx-1.onrender.com';
    const streamSecret = process.env.STREAMING_API_SECRET || process.env.PARTNER_API_SECRET || 'your_secret_from_env';
    
    const response = await axios.post(`${streamUrl}/api/auth/external-sync`, {
      secret: streamSecret,
      email: userEmail,
      username: userName,
      plan: 'premium', // Automatically mark them as Premium
      active: true
    }, { timeout: 10000 });
    
    console.log(`✅ NetX Sync successful for ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ NetX Sync failed:', error.response?.data?.message || error.message);
    return false;
  }
}

module.exports = { syncToNetX };
