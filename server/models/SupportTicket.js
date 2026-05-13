const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'subscription', 'technical', 'other'],
    default: 'other' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'closed'], 
    default: 'open' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  replies: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
