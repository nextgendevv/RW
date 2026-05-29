const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CommissionConfig = require('./models/CommissionConfig');
const Package = require('./models/Package');

dotenv.config();

const seedCommissionConfig = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const packages = await Package.find();
    console.log(`Found ${packages.length} packages`);

    if (packages.length === 0) {
      console.log('No packages found. Please seed packages first using: node seed-packages.js');
      process.exit(1);
    }

    // Default commission percentage (10%)
    const defaultCommissionPercentage = 10;

    for (const pkg of packages) {
      const existingConfig = await CommissionConfig.findOne({ plan: pkg.key });
      
      if (existingConfig) {
        console.log(`✓ Commission config already exists for ${pkg.name}`);
      } else {
        const config = new CommissionConfig({
          plan: pkg.key,
          planName: pkg.name,
          planPrice: pkg.price,
          commissionPercentage: defaultCommissionPercentage,
          isActive: true
        });
        
        await config.save();
        console.log(`✓ Created commission config for ${pkg.name}: ${defaultCommissionPercentage}%`);
      }
    }

    const configs = await CommissionConfig.find();
    console.log('\n📊 Commission Configuration Summary:');
    console.log('================================');
    configs.forEach(config => {
      const commissionAmount = config.planPrice * (config.commissionPercentage / 100);
      console.log(`${config.planName}: ${config.commissionPercentage}% = ₹${commissionAmount.toFixed(2)} (on ₹${config.planPrice})`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Commission configuration seeded successfully!');
  } catch (err) {
    console.error('Error seeding commission config:', err);
    process.exit(1);
  }
};

seedCommissionConfig();
