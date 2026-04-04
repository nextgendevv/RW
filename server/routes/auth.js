const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

async function syncToNetX(userEmail, userName) {
  try {
    const response = await axios.post('https://netx-1.onrender.com/api/auth/external-sync', {
      secret: process.env.PARTNER_API_SECRET || 'your_secret_from_env', // Use the same PARTNER_API_SECRET
      email: userEmail,
      username: userName,
      plan: 'premium', // Automatically mark them as Premium
      active: true
    });
    console.log('Account created on NetX successfully!');
  } catch (error) {
    console.error('NetX Sync failed:', error.response?.data?.message || error.message);
  }
}

// @route   POST /api/auth/register
// @desc    Register a user
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword, referralCode } = req.body;

  if (!firstName || !email || !phone || !password) {
    console.log('REGISTER_FAIL: Missing required fields');
    return res.status(400).json({ message: 'Please enter all required fields.' });
  }

  if (password.length < 6) {
    console.log('REGISTER_FAIL: Password too short');
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  if (password !== confirmPassword) {
    console.log('REGISTER_FAIL: Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log(`REGISTER_FAIL: Email already exists: ${email}`);
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      referredBy: referralCode,
    });

    await user.save();
    console.log(`REGISTER_SUCCESS: User created: ${email}`);

    // Sync to NetX
    await syncToNetX(email, firstName);

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error('REGISTER_ERROR:', err);
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('LOGIN_FAIL: Missing email or password');
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`LOGIN_FAIL: User not found for email: ${email}`);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`LOGIN_FAIL: Password mismatch for user: ${email}`);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      console.log(`LOGIN_SUCCESS: User logged in: ${email}`);
      res.json({ token });
    });
  } catch (err) {
    console.error('LOGIN_ERROR:', err);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('GET_ME_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching user.' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', authMiddleware, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('UPDATE_ME_ERROR:', err);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
});

module.exports = router;