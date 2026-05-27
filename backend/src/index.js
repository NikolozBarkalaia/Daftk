const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

// Initialize MySQL (creates tables on first run)
const { init } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Trust nginx's X-Forwarded-For so IP rate limiting sees the real client IP
app.set('trust proxy', 1);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/slider', require('./routes/sliderRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Ubill SMS delivery status callback
app.post('/callback', (req, res) => {
  // Ubill posts delivery reports here. Log for monitoring; extend as needed.
  console.log('[Ubill Callback]', JSON.stringify(req.body));
  res.sendStatus(200);
});

// ტესტირება
// app.use('/api', require('./routes/testRoutes'));
app.use('/api', require('./routes/verifyRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

init()
  .then(() => {
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
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });

