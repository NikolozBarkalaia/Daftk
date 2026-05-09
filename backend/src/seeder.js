const dotenv = require('dotenv');
dotenv.config();

// Initialize DB (creates tables)
require('./config/db');
const User = require('./models/User');

const importData = async () => {
  try {
    User.deleteAll();

    await User.create({
      name: 'Admin User',
      email: 'admin@daftk.com',
      password: 'password123',
      isAdmin: true,
    });

    console.log('Data Imported - Admin user created!');
    console.log('Email: admin@daftk.com');
    console.log('Password: password123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
