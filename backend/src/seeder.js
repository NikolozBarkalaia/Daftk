const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create an admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@daftk.com',
      password: 'password123', // Will be hashed by pre-save hook
      isAdmin: true
    });

    await adminUser.save();

    console.log('Data Imported - Admin user created!');
    console.log('Email: admin@daftk.com');
    console.log('Password: password123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Add destroy data logic here if needed
} else {
  importData();
}
