const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  referralCode: { type: String, unique: true, sparse: true }, // The user's own referral code
  referredBy: { type: String }, // The referral code they used to sign up
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Generate a random 8-character referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Hash password and generate referral code before saving
userSchema.pre('save', async function() {
  if (this.isNew && !this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;