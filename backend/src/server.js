import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body Parsing Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Mess & KFC Express Server Running', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Mess & KFC Express Server Running', timestamp: new Date().toISOString() });
});

// Primary API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message || 'Unknown server error'
  });
});

// MongoDB Connection with seamless in-memory fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc';
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('✅ Connected to MongoDB database'))
  .catch(() => {
    console.log('ℹ️ MongoDB not connected. Running seamlessly with in-memory seed dataset.');
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});