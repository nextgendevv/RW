const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true }, // e.g. '1_month'
  price: { type: Number, required: true }, // This is the final price
  originalPrice: { type: Number }, // Price before discount
  discountPercentage: { type: Number }, // For display
  durationInDays: { type: Number, required: true },
  description: { type: String },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
