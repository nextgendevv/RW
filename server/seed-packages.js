const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('./models/Package');

dotenv.config();

const seedPackages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const defaultPackages = [
      {
        name: '1 Month',
        key: '1_month',
        price: 99,
        durationInDays: 30,
        description: 'Starter plan for testing the platform.',
        features: ['10% Referral Commission', 'Access to NetX Streaming', 'Verified Profile Badge']
      },
      {
        name: '1 Year',
        key: '1_year',
        price: 499,
        durationInDays: 365,
        description: 'Most popular plan for long term growth.',
        features: ['10% Referral Commission', 'Access to NetX Streaming', 'Verified Profile Badge', 'Priority Support']
      },
      {
        name: '5 Years',
        key: '5_years',
        price: 1999,
        durationInDays: 1825,
        description: 'Best value for serious networkers.',
        features: ['10% Referral Commission', 'Access to NetX Streaming', 'Verified Profile Badge', 'Priority Support', 'Early Access to Features']
      }
    ];

    for (const pkg of defaultPackages) {
      await Package.findOneAndUpdate(
        { key: pkg.key },
        pkg,
        { upsert: true, new: true }
      );
    }

    console.log('Packages seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding packages:', err);
    process.exit(1);
  }
};

seedPackages();
