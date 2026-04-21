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

    // We will fetch up to 10 levels
    const maxLevels = 10;
    const levels = {};
    const summary = {};
    let totalItems = 0;
    
    // Create base response structure
    for (let i = 1; i <= maxLevels; i++) {
        levels[`level${i}`] = [];
        summary[`level${i}Count`] = 0;
    }

    let currentLevelUsers = await User.find({ referredBy: currentUser.referralCode }).select('-password');
    levels['level1'] = currentLevelUsers;
    summary['level1Count'] = currentLevelUsers.length;
    totalItems += currentLevelUsers.length;

    let currentLevelCodes = currentLevelUsers.map(u => u.referralCode);

    for (let i = 2; i <= maxLevels; i++) {
      if (currentLevelCodes.length === 0) {
        break; // Stop fetching if current level has no users
      }
      const nextLevelUsers = await User.find({ referredBy: { $in: currentLevelCodes } }).select('-password');
      levels[`level${i}`] = nextLevelUsers;
      summary[`level${i}Count`] = nextLevelUsers.length;
      totalItems += nextLevelUsers.length;
      
      currentLevelCodes = nextLevelUsers.map(u => u.referralCode).filter(Boolean);
    }
    
    summary.totalItems = totalItems;

    // Helper to build a nested tree
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

    const tree = buildTree(currentUser.referralCode, 1);

    res.json({
      summary,
      levels,
      tree
    });
  } catch (err) {
    console.error('TEAMS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching team data.' });
  }
});

module.exports = router;
