require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketInit = require('./socket');

// Route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const experienceRoutes = require('./routes/experiences');
const siteSettingRoutes = require('./routes/siteSettings');
const testimonialRoutes = require('./routes/testimonials');
const sectionRoutes = require('./routes/sections');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const socialLinkRoutes = require('./routes/socialLinks');


// Connect to Database
connectDB();

const app = express();

// Trust proxy for reverse proxies like Render
app.set('trust proxy', 1);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS — comma-separated origins in CLIENT_URL (no trailing slashes)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / same-origin proxy requests (no Origin header)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV === 'development') {
        console.warn(`CORS blocked origin: ${origin}`);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/settings', siteSettingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social-links', socialLinkRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teshome Portfolio API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`\n Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(` API available at http://localhost:${PORT}/api`);
});

// ─── Socket.io (real-time) ────────────────────────────────────────────────────
socketInit.init(server);
console.log(' Socket.io initialized for real-time updates');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(` Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
