const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

// @route   POST /api/streaming/sync-access
// @desc    Sync user with the partner streaming website
// @access  Private
router.post('/sync-access', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.subscription) {
      return res.status(403).json({ message: 'Active subscription required for streaming access.' });
    }

    const streamUrl = process.env.STREAMING_SITE_URL;
    const streamSecret = process.env.STREAMING_API_SECRET;

    if (!streamUrl || !streamSecret) {
         return res.status(500).json({ message: 'Streaming integration not configured on this server.' });
    }

    // Call the streaming site partner API securely
    const response = await axios.post(`${streamUrl}/api/partner/sync-user`, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || '',
        secret: streamSecret 
    }, { timeout: 10000 }); // 10 second timeout

    res.json({ success: true, redirectUrl: streamUrl });
  } catch (err) {
      console.error('STREAMING_SYNC_ERROR:', err.response?.data || err.message);
      res.status(500).json({ 
        message: "Failed to communicate with streaming service.",
        error: err.response?.data?.message || err.message 
      });
  }
});

// @route   POST /api/streaming/subscribe
// @desc    Mock subscription purchase and distribute 10% commission
// @access  Private
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Plan prices
    const prices = {
      '1_month': 99,
      '1_year': 499,
      '5_years': 1999
    };

    const price = prices[plan] || 499;
    const commissionAmount = price * 0.10; // 10% share

    user.subscription = true;
    user.subscriptionPlan = plan || '1_year';
    await user.save();

    // Distribute commission to referrer
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        referrer.walletBalance = (referrer.walletBalance || 0) + commissionAmount;
        await referrer.save();

        // Log commission
        const Commission = require('../models/Commission');
        await Commission.create({
          recipient: referrer._id,
          fromUser: user._id,
          amount: commissionAmount,
          plan: plan,
          level: 1
        });
      }
    }

    res.json({ success: true, user });
  } catch (err) {
      console.error('STREAMING_SUBSCRIBE_ERROR:', err.message);
      res.status(500).json({ message: "Failed to process subscription." });
  }
});

module.exports = router;
