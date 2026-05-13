const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const auth = require('../middleware/auth');

// @route   POST /api/support/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/tickets', auth, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    
    const ticket = new SupportTicket({
      user: req.user.id,
      subject,
      message,
      category,
      priority
    });

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error('CREATE_TICKET_ERROR:', err);
    res.status(500).json({ message: 'Server error while creating ticket' });
  }
});

// @route   GET /api/support/tickets
// @desc    Get all tickets for the logged-in user
// @access  Private
router.get('/tickets', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error('GET_USER_TICKETS_ERROR:', err);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
});

// @route   POST /api/support/tickets/:id/reply
// @desc    User reply to a ticket
// @access  Private
router.post('/tickets/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status === 'closed') return res.status(400).json({ message: 'Ticket is closed' });

    ticket.replies.push({
      sender: 'user',
      message
    });
    ticket.status = 'open'; // Re-open or keep open for admin attention
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error('USER_REPLY_TICKET_ERROR:', err);
    res.status(500).json({ message: 'Server error while replying to ticket' });
  }
});

module.exports = router;
