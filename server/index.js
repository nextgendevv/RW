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

// 1. BASIC MIDDLEWARE FIRST
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://rw-ghhg.onrender.com',
  'https://netx-1.onrender.com',
  'https://netx-5y1m.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); 
    }
  },
  credentials: true
}));

app.use(express.json());

// 2. API ROUTES IMMEDIATELY AFTER JSON PARSER
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/external', externalRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// 3. STATIC FILES AND CATCH-ALL AT THE VERY BOTTOM
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  const distPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(distPath));

  // Using regex literal for catch-all to be compatible with Express 5
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'Richway API is running' }));
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
