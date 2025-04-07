const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const eventRoutes = require('./routes/events');
const memberRoutes = require('./routes/members');
const feeRoutes = require('./routes/fees');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced logging format for Morgan
const logFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : ':method :url :status :response-time ms - :res[content-length]';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(logFormat, {
  skip: (req, res) => process.env.NODE_ENV === 'production' && res.statusCode < 400,
  stream: { write: message => console.log(message.trim()) }
}));

// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    
    // Log additional details for errors
    if (res.statusCode >= 400) {
      console.error(`Error response: ${res.statusCode} for ${req.method} ${req.originalUrl}`);
    }
  });
  
  next();
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/fees', feeRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TinhTien API is running' });
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  console.log('[Health Check] API health check requested');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tinhtien';
console.log(`Attempting to connect to MongoDB with URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Log URI with hidden credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📅 ${new Date().toISOString()}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.error('Please check your MONGODB_URI environment variable in .env file');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;