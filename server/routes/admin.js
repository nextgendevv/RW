const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Deposit = require('../models/Deposit');
const axios = require('axios');
const { syncToNetX } = require('../utils/sync');


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
    
    // Date ranges
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usersToday = await User.countDocuments({ createdAt: { $gte: todayStart } });
    const usersYesterday = await User.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } });
    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Financial Stats
    const deposits = await Deposit.find({ status: 'approved' });
    const totalRevenue = deposits.reduce((sum, dep) => sum + dep.amount, 0);

    const Commission = require('../models/Commission');
    const commissions = await Commission.find();
    const totalCommissions = commissions.reduce((sum, com) => sum + com.amount, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, com) => sum + com.amount, 0);

    // Daily Stats for Chart (Last 14 days)
    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyRevenue = await Deposit.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge stats into a consistent array for the chart
    const chartData = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const userStat = dailyUsers.find(u => u._id === dateStr);
      const revStat = dailyRevenue.find(r => r._id === dateStr);
      
      chartData.push({
        date: dateStr,
        users: userStat ? userStat.count : 0,
        revenue: revStat ? revStat.amount : 0
      });
    }

    res.json({
      totalUsers,
      usersToday,
      usersYesterday,
      newUsersLast7Days,
      totalRevenue,
      totalCommissions,
      pendingCommissions,
      activeUsers: await User.countDocuments({ subscription: true }),
      inactiveUsers: await User.countDocuments({ subscription: false }),
      chartData,
      roleStats: await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
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
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + deposit.amount;
        await user.save();
      }
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

// @route   GET /api/admin/commissions
// @desc    Get all commission share records
// @access  Private/Admin
router.get('/commissions', [auth, admin], async (req, res) => {
  try {
    const Commission = require('../models/Commission');
    const commissions = await Commission.find()
      .populate('recipient', 'firstName lastName email')
      .populate('fromUser', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(commissions);
  } catch (err) {
    console.error('ADMIN_GET_COMMISSIONS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching commissions.' });
  }
});

// @route   PUT /api/admin/commissions/:id/pay
// @desc    Manually approve (give) a commission to a referrer
// @access  Private/Admin
router.put('/commissions/:id/pay', [auth, admin], async (req, res) => {
  try {
    const Commission = require('../models/Commission');
    const commission = await Commission.findById(req.params.id);
    
    if (!commission) return res.status(404).json({ message: 'Commission record not found' });
    if (commission.status === 'paid') return res.status(400).json({ message: 'Commission is already paid' });

    // Mark as paid
    commission.status = 'paid';
    await commission.save();

    // Credit the recipient's main wallet
    const recipient = await User.findById(commission.recipient);
    if (recipient) {
      recipient.mainWalletBalance = (recipient.mainWalletBalance || 0) + commission.amount;
      await recipient.save();
    }

    res.json({ message: 'Commission given successfully.', commission });
  } catch (err) {
    console.error('ADMIN_PAY_COMMISSION_ERROR:', err);
    res.status(500).json({ message: 'Server error while giving commission.' });
  }
});

// @route   GET /api/admin/packages
// @desc    Get all packages
// @access  Private/Admin
router.get('/packages', [auth, admin], async (req, res) => {
  try {
    const Package = require('../models/Package');
    const packages = await Package.find().sort({ price: 1 });
    res.json(packages);
  } catch (err) {
    console.error('ADMIN_GET_PACKAGES_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching packages.' });
  }
});

// @route   POST /api/admin/packages
// @desc    Create a new package
// @access  Private/Admin
router.post('/packages', [auth, admin], async (req, res) => {
  try {
    const { name, key, price, originalPrice, discountPercentage, durationInDays, description, features, isActive } = req.body;
    const Package = require('../models/Package');
    
    let pkg = await Package.findOne({ key });
    if (pkg) return res.status(400).json({ message: 'Package with this key already exists.' });

    pkg = new Package({ name, key, price, originalPrice, discountPercentage, durationInDays, description, features, isActive });
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    console.error('ADMIN_CREATE_PACKAGE_ERROR:', err);
    res.status(500).json({ message: 'Server error while creating package.' });
  }
});

// @route   PUT /api/admin/packages/:id
// @desc    Update a package
// @access  Private/Admin
router.put('/packages/:id', [auth, admin], async (req, res) => {
  try {
    const { name, key, price, originalPrice, discountPercentage, durationInDays, description, features, isActive } = req.body;
    const Package = require('../models/Package');
    
    let pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    if (name) pkg.name = name;
    if (key) pkg.key = key;
    if (price !== undefined) pkg.price = price;
    if (originalPrice !== undefined) pkg.originalPrice = originalPrice;
    if (discountPercentage !== undefined) pkg.discountPercentage = discountPercentage;
    if (durationInDays !== undefined) pkg.durationInDays = durationInDays;
    if (description !== undefined) pkg.description = description;
    if (features !== undefined) pkg.features = features;
    if (isActive !== undefined) pkg.isActive = isActive;

    await pkg.save();
    res.json(pkg);
  } catch (err) {
    console.error('ADMIN_UPDATE_PACKAGE_ERROR:', err);
    res.status(500).json({ message: 'Server error while updating package.' });
  }
});

// @route   DELETE /api/admin/packages/:id
// @desc    Delete a package
// @access  Private/Admin
router.delete('/packages/:id', [auth, admin], async (req, res) => {
  try {
    const Package = require('../models/Package');
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('ADMIN_DELETE_PACKAGE_ERROR:', err);
    res.status(500).json({ message: 'Server error while deleting package.' });
  }
});

// @route   GET /api/admin/withdrawals
// @desc    Get all withdrawal requests
// @access  Private/Admin
router.get('/withdrawals', [auth, admin], async (req, res) => {
  try {
    const Withdrawal = require('../models/Withdrawal');
    const withdrawals = await Withdrawal.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('ADMIN_GET_WITHDRAWALS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching withdrawals.' });
  }
});

// @route   PUT /api/admin/withdrawals/:id/:action
// @desc    Approve or reject a withdrawal
// @access  Private/Admin
router.put('/withdrawals/:id/:action', [auth, admin], async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'reject'
    const { adminMessage } = req.body;
    const Withdrawal = require('../models/Withdrawal');
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Withdrawal is already ' + withdrawal.status });

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.adminMessage = adminMessage || 'Withdrawal approved and processed.';
      await withdrawal.save();
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
      withdrawal.adminMessage = adminMessage || 'Withdrawal rejected.';
      await withdrawal.save();
      
      // Refund the amount to main wallet
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.mainWalletBalance = (user.mainWalletBalance || 0) + withdrawal.amount;
        await user.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: `Withdrawal ${action}d successfully.`, withdrawal });
  } catch (err) {
    console.error('ADMIN_WITHDRAWAL_ACTION_ERROR:', err);
    res.status(500).json({ message: 'Server error while processing withdrawal.' });
  }
});

// @route   GET /api/admin/support/tickets
// @desc    Get all support tickets
// @access  Private/Admin
router.get('/support/tickets', [auth, admin], async (req, res) => {
  try {
    const SupportTicket = require('../models/SupportTicket');
    const tickets = await SupportTicket.find()
      .populate('user', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error('ADMIN_GET_TICKETS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
});

// @route   POST /api/admin/support/tickets/:id/reply
// @desc    Admin reply to a ticket
// @access  Private/Admin
router.post('/support/tickets/:id/reply', [auth, admin], async (req, res) => {
  try {
    const { message, status } = req.body;
    const SupportTicket = require('../models/SupportTicket');
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.replies.push({
      sender: 'admin',
      message
    });
    
    if (status) ticket.status = status;
    else ticket.status = 'in-progress';

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error('ADMIN_REPLY_TICKET_ERROR:', err);
    res.status(500).json({ message: 'Server error while replying to ticket' });
  }
});

// @route   PUT /api/admin/support/tickets/:id/status
// @desc    Update ticket status
// @access  Private/Admin
router.put('/support/tickets/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const SupportTicket = require('../models/SupportTicket');
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    console.error('ADMIN_STATUS_TICKET_ERROR:', err);
    res.status(500).json({ message: 'Server error while updating ticket status' });
  }
});

module.exports = router;
