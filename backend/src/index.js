const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

// Initialize SQLite (creates tables on first run)
require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/slider', require('./routes/sliderRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n\x1b[31mERROR: Port ${PORT} is already in use.\x1b[0m`);
    console.error('On macOS, AirPlay Receiver uses port 5000. Try a different port or disable AirPlay Receiver in System Settings → General → AirDrop & Handoff.\n');
  } else {
    console.error(err);
  }
  process.exit(1);
});

