const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./db');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');
const streamingRoutes = require('./routes/streaming');
const walletRoutes = require('./routes/wallet');
const externalRoutes = require('./routes/external');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Production Optimizations
app.use(helmet({
  contentSecurityPolicy: false, // Let React handle CSP if needed
}));
app.use(compression());

// CORS configuration - Allow local dev and same-origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://rw-ghhg.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // For production same-origin, it might be null or the actual origin. 
      // Simplified for now, can be hardened later.
    }
  },
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/external', externalRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('(.*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Basic root route for API health/info in development
  app.get('/', (req, res) => res.json({ message: 'Richway API is running' }));
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

