const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');
const { syncToNetX } = require('../utils/sync');
const Package = require('../models/Package');

// @route   GET /api/streaming/packages
// @desc    Get all active packages for users
// @access  Public
router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });
    res.json(packages);
  } catch (err) {
    console.error('GET_PACKAGES_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching packages.' });
  }
});

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
    console.log(`Attempting sync with: ${streamUrl}/api/auth/external-sync`);
    const response = await axios.post(`${streamUrl}/api/auth/external-sync`, {
        email: user.email,
        username: user.firstName,
        secret: streamSecret,
        plan: 'premium',
        active: true
    }, { timeout: 15000 }); // Increased timeout for Render-to-Render communication

    res.json({ success: true, redirectUrl: streamUrl });
  } catch (err) {
      const errorDetail = err.response?.data?.message || err.response?.data || err.message;
      console.error('❌ STREAMING_SYNC_ERROR:', errorDetail);
      res.status(500).json({ 
        message: "Failed to communicate with streaming service.",
        error: errorDetail,
        debug_info: {
            url_attempted: process.env.STREAMING_SITE_URL,
            has_secret: !!process.env.STREAMING_API_SECRET
        }
      });
  }
});

// @route   POST /api/streaming/subscribe
// @desc    Mock subscription purchase and distribute 10% commission
// @access  Private
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive package selected.' });
    }

    const price = pkg.price;
    const plan = pkg.key;
    
    // Check if user has enough balance
    if ((user.walletBalance || 0) < price) {
      return res.status(400).json({ 
        message: `Insufficient balance. This plan costs ₹${price}, but your balance is ₹${user.walletBalance || 0}. Please add funds first.` 
      });
    }

    const commissionAmount = price * 0.10; // 10% share

    // Deduct price from user's wallet
    user.walletBalance = (user.walletBalance || 0) - price;
    user.subscription = true;
    user.subscriptionPlan = plan || '1_year';
    await user.save();

    // Sync to NetX (background)
    syncToNetX(user.email, user.firstName).catch(err => console.error('NetX Sync Error:', err));

    // Log commission as PENDING (Admin must "give" it manually)
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const Commission = require('../models/Commission');
        await Commission.create({
          recipient: referrer._id,
          fromUser: user._id,
          amount: commissionAmount,
          plan: plan,
          level: 1,
          status: 'pending'
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
