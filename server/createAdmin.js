const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@richway.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists. Updating to admin role...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      const admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        phone: '0000000000',
        password: 'adminpassword123',
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully.');
      console.log('Email: admin@richway.com');
      console.log('Password: adminpassword123');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
