const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function promoteToAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Success! ${user.email} is now an admin.`);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error promoting user:', err);
  } finally {
    await mongoose.disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promote-admin.js <email>');
  process.exit(1);
}

promoteToAdmin(email);
