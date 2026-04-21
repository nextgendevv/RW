const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/wallet/deposit
// @desc    Create a deposit request
// @access  Private
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, utrNumber } = req.body;
    if (!amount || amount <= 0 || !utrNumber) {
       return res.status(400).json({ message: 'Valid amount and UTR number are required.' });
    }
    const deposit = new Deposit({
      user: req.user.id,
      amount,
      utrNumber
    });
    await deposit.save();
    res.json({ success: true, deposit });
  } catch (err) {
    console.error('DEPOSIT_REQ_ERROR:', err);
    res.status(500).json({ message: 'Server error processing deposit request.' });
  }
});

// @route   GET /api/wallet/deposits
// @desc    Get user's deposit requests and current wallet balance
// @access  Private
router.get('/deposits', authMiddleware, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id).select('walletBalance');
    res.json({ deposits, balance: user.walletBalance || 0 });
  } catch (err) {
    console.error('GET_DEPOSITS_ERROR:', err);
    res.status(500).json({ message: 'Server error fetching wallet data.' });
  }
});

module.exports = router;
