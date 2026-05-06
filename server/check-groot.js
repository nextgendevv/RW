const mongoose = require('mongoose');
const User = require('./models/User');
const Deposit = require('./models/Deposit');
require('dotenv').config();

async function checkUser(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Balance: ${user.walletBalance}`);
    
    const deposits = await Deposit.find({ user: user._id });
    console.log('Deposits:');
    deposits.forEach(d => {
      console.log(`- Amount: ${d.amount}, Status: ${d.status}, ID: ${d._id}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser('groot11@gmail.com');
