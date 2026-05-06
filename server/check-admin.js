const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log(`User: ${user.email}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

const email = process.argv[2] || 'admin@richway.com';
checkAdmin(email);
