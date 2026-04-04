const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'email firstName lastName');
    if (users.length > 0) {
      console.log('Available Users:');
      users.forEach(u => console.log(`- ${u.email} (${u.firstName} ${u.lastName})`));
    } else {
      console.log('No users found in database.');
    }
  } catch (err) {
    console.error('Error listing users:', err);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
