const mongoose = require('mongoose');
const User = require('./models/User'); // This model has a pre-save hook that hashes passwords
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // We find the user and MANUALLY set the password string. 
    // The pre-save hook in User.js line 22 will automatically hash 'admin123' for us.
    const user = await User.findOne({ email: 'worldaim@gmail.com' });
    
    if (user) {
      user.password = 'admin123';
      await user.save();
      console.log('SUCCESS: Password for worldaim@gmail.com has been reset to: admin123');
    } else {
      console.log('FAILED: User worldaim@gmail.com not found.');
    }
  } catch (err) {
    console.error('ERROR during reset:', err);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
