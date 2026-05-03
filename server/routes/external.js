const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/external/verify
 * @desc    Check if a user exists and has an active subscription
 * @access  Public (Secret verified)
 */
router.get('/verify', async (req, res) => {
  try {
    const { email, secret } = req.query;
    const envSecret = (process.env.STREAMING_API_SECRET || '').trim();

    if (!secret || secret !== envSecret) {
      return res.status(401).json({ message: 'Invalid partner secret' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ isRichwayUser: false, hasSubscription: false });
    }

    res.json({
      isRichwayUser: true,
      hasSubscription: user.subscription === true,
      username: user.firstName
    });
  } catch (err) {
    console.error('EXTERNAL_VERIFY_ERROR:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

/**
 * @route   POST /api/external/verify-login
 * @desc    Validate user credentials for external platforms
 * @access  Public (Secret verified)
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { email, password, secret } = req.body;
    const envSecret = (process.env.STREAMING_API_SECRET || '').trim();

    if (!secret || secret !== envSecret) {
      return res.status(401).json({ message: 'Invalid partner secret' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      username: user.firstName,
      isPremium: user.subscription === true
    });
  } catch (err) {
    console.error('EXTERNAL_LOGIN_ERROR:', err);
    res.status(500).json({ message: 'Server error during login verification' });
  }
});

module.exports = router;
