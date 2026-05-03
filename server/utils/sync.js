const axios = require('axios');

/**
 * Sync user to the partner streaming service (NetX)
 * @param {string} userEmail 
 * @param {string} userName 
 */
async function syncToNetX(userEmail, userName, password = null) {
  try {
    const streamUrl = process.env.STREAMING_SITE_URL || 'https://netx-1.onrender.com';
    const streamSecret = process.env.STREAMING_API_SECRET || process.env.PARTNER_API_SECRET || 'your_secret_from_env';
    
    const syncData = {
      secret: streamSecret,
      email: userEmail,
      username: userName,
      plan: 'premium',
      active: true
    };

    if (password) {
      syncData.password = password; // Send plain password if provided (during register)
    }
    
    const response = await axios.post(`${streamUrl}/api/auth/external-sync`, syncData, { timeout: 15000 });
    
    console.log(`✅ NetX Sync successful for ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ NetX Sync failed:', error.response?.data?.message || error.message);
    return false;
  }
}

module.exports = { syncToNetX };
