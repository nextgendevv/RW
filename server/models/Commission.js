const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  plan: { type: String, required: true },
  level: { type: Number, default: 1 }, // Level in the hierarchy
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);
