const mongoose = require('mongoose');

const commissionConfigSchema = new mongoose.Schema({
  plan: { type: String, required: true, unique: true }, // '1_month', '1_year', '5_years'
  commissionPercentage: { type: Number, required: true, min: 0, max: 100 }, // e.g., 10, 15, 20
  planName: { type: String }, // 'Monthly', 'Yearly', 'Premium' etc
  planPrice: { type: Number }, // Current price of the plan (for preview)
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('CommissionConfig', commissionConfigSchema);
