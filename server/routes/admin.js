const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Deposit = require('../models/Deposit');
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

// @route   GET /api/admin/users/:id/team
// @desc    Get user's recruitment tree (10 levels) for Admin
// @access  Private/Admin
router.get('/users/:id/team', [auth, admin], async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser || !targetUser.referralCode) {
      return res.status(404).json({ message: 'User or referral code not found' });
    }

    const maxLevels = 10;
    const levels = {};
    const summary = {};
    let totalItems = 0;
    
    for (let i = 1; i <= maxLevels; i++) {
        levels[`level${i}`] = [];
        summary[`level${i}Count`] = 0;
    }

    let currentLevelUsers = await User.find({ referredBy: targetUser.referralCode }).select('-password');
    levels['level1'] = currentLevelUsers;
    summary['level1Count'] = currentLevelUsers.length;
    totalItems += currentLevelUsers.length;

    let currentLevelCodes = currentLevelUsers.map(u => u.referralCode);

    for (let i = 2; i <= maxLevels; i++) {
      if (currentLevelCodes.length === 0) break;
      const nextLevelUsers = await User.find({ referredBy: { $in: currentLevelCodes } }).select('-password');
      levels[`level${i}`] = nextLevelUsers;
      summary[`level${i}Count`] = nextLevelUsers.length;
      totalItems += nextLevelUsers.length;
      
      currentLevelCodes = nextLevelUsers.map(u => u.referralCode).filter(Boolean);
    }
    
    summary.totalItems = totalItems;

    const buildTree = (referralCode, currentLevel) => {
        if (currentLevel > maxLevels) return [];
        const usersInNextLevel = levels[`level${currentLevel}`] || [];
        const directChildren = usersInNextLevel.filter(u => u.referredBy === referralCode);
        
        return directChildren.map(child => {
             return {
                 ...child.toObject(),
                 level: currentLevel,
                 children: buildTree(child.referralCode, currentLevel + 1)
             };
        });
    };

    const tree = buildTree(targetUser.referralCode, 1);

    res.json({
      targetUser,
      summary,
      levels,
      tree
    });
  } catch (err) {
    console.error('ADMIN_GET_TEAM_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching team data.' });
  }
});

// @route   GET /api/admin/deposits
// @desc    Get all wallet deposit requests
// @access  Private/Admin
router.get('/deposits', [auth, admin], async (req, res) => {
  try {
    const deposits = await Deposit.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    console.error('ADMIN_GET_DEPOSITS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching deposits.' });
  }
});

// @route   PUT /api/admin/deposits/:id/:action
// @desc    Approve or reject a deposit
// @access  Private/Admin
router.put('/deposits/:id/:action', [auth, admin], async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'reject'
    const deposit = await Deposit.findById(req.params.id);
    
    if (!deposit) return res.status(404).json({ message: 'Deposit request not found' });
    if (deposit.status !== 'pending') return res.status(400).json({ message: 'Deposit is already ' + deposit.status });

    if (action === 'approve') {
      deposit.status = 'approved';
      await deposit.save();
      const user = await User.findById(deposit.user);
      user.walletBalance = (user.walletBalance || 0) + deposit.amount;
      await user.save();
    } else if (action === 'reject') {
      deposit.status = 'rejected';
      await deposit.save();
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: `Deposit ${action}d successfully.`, deposit });
  } catch (err) {
    console.error('ADMIN_DEPOSIT_ACTION_ERROR:', err);
    res.status(500).json({ message: 'Server error while processing deposit.' });
  }
});

module.exports = router;
