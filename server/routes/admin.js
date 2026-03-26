const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

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

module.exports = router;
