const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin only.' });
    }
  } catch (err) {
    console.error('ADMIN_MIDDLEWARE_ERROR:', err);
    res.status(500).json({ message: 'Server error in admin authorization.' });
  }
};

module.exports = admin;
