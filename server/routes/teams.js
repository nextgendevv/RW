const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/teams
// @desc    Get user's recruitment tree (3 levels)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.referralCode) {
      return res.status(404).json({ message: 'User or referral code not found' });
    }

    // Level 1: Direct referrals
    const level1 = await User.find({ referredBy: currentUser.referralCode }).select('-password');
    const level1Codes = level1.map(u => u.referralCode);

    // Level 2: Referrals from Level 1
    const level2 = await User.find({ referredBy: { $in: level1Codes } }).select('-password');
    const level2Codes = level2.map(u => u.referralCode);

    // Level 3: Referrals from Level 2
    const level3 = await User.find({ referredBy: { $in: level2Codes } }).select('-password');

    res.json({
      summary: {
        totalItems: level1.length + level2.length + level3.length,
        level1Count: level1.length,
        level2Count: level2.length,
        level3Count: level3.length,
      },
      levels: {
        level1,
        level2,
        level3
      }
    });
  } catch (err) {
    console.error('TEAMS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching team data.' });
  }
});

module.exports = router;
