const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  adminMessage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
