const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
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
    console.log('Account created/synced on NetX successfully!');
  } catch (error) {
    console.error('NetX Sync failed:', error.response?.data?.message || error.message);
  }
}

// @route   GET /api/admin/users
// @desc    Get all users with basic info
// @access  Private/Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('ADMIN_GET_USERS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Distribution of users by role
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // New users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      totalUsers,
      roleStats,
      newUsersLast7Days: newUsers
    });
  } catch (err) {
    console.error('ADMIN_GET_STATS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
});

// @route   PUT /api/admin/users/:id/premium
// @desc    Upgrade a user to Premium and sync to NetX
// @access  Private/Admin
router.put('/users/:id/premium', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = true;
    await user.save();

    // Sync to NetX
    await syncToNetX(user.email, user.firstName);

    res.json({ message: 'User upgraded to Premium and synced to NetX', user });
  } catch (err) {
    console.error('ADMIN_UPGRADE_USER_ERROR:', err);
    res.status(500).json({ message: 'Server error while upgrading user.' });
  }
});

module.exports = router;
