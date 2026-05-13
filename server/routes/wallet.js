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

const Withdrawal = require('../models/Withdrawal');

// @route   GET /api/wallet/summary
// @desc    Get user's wallet balances and history
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance mainWalletBalance bankName accountNumber ifscCode accountHolderName');
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.json({ 
      depositBalance: user.walletBalance || 0,
      mainBalance: user.mainWalletBalance || 0,
      deposits,
      withdrawals,
      bankDetails: {
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        accountHolderName: user.accountHolderName
      }
    });
  } catch (err) {
    console.error('GET_WALLET_SUMMARY_ERROR:', err);
    res.status(500).json({ message: 'Server error fetching wallet data.' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Create a withdrawal request from main wallet
// @access  Private
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    if (user.mainWalletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in Main Wallet.' });
    }

    if (!user.bankName || !user.accountNumber) {
      return res.status(400).json({ message: 'Please update your bank details in profile before withdrawing.' });
    }

    // Deduct from main wallet immediately (reserve it)
    user.mainWalletBalance -= amount;
    await user.save();

    const withdrawal = new Withdrawal({
      user: req.user.id,
      amount,
      bankDetails: {
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        accountHolderName: user.accountHolderName
      }
    });

    await withdrawal.save();
    res.json({ success: true, withdrawal, newMainBalance: user.mainWalletBalance });
  } catch (err) {
    console.error('WITHDRAWAL_REQ_ERROR:', err);
    res.status(500).json({ message: 'Server error processing withdrawal request.' });
  }
});

module.exports = router;
