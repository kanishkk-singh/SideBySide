require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const connectDB = require('./config/db');
const { getJwtSecret } = require('./config/env');
const { seedTopics } = require('./data/seedTopics');

const authRoutes     = require('./routes/auth');
const debateRoutes   = require('./routes/debates');
const argumentRoutes = require('./routes/arguments');
const topicRoutes    = require('./routes/topics');
const userRoutes     = require('./routes/users');

const app = express();

// ✅ CORS FIX (important)
app.use(cors({
  origin: "*",   // production me specific URL dena (abhi testing ke liye open)
  credentials: true
}));

// middleware
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ ROOT FIX (Cannot GET / fix)
app.get('/', (req, res) => {
  res.send('SideBySide Backend Running 🚀');
});

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/debates',   debateRoutes);
app.use('/api/arguments', argumentRoutes);
app.use('/api/topics',    topicRoutes);
app.use('/api/users',     userRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    getJwtSecret();
    await connectDB();
    await seedTopics();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
};

startServer();