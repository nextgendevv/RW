const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./db');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Serve static files from the React client app
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

