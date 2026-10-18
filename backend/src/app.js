import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import apiRoutes from './routes/apiRoutes.js';
import { realtimeAndAudit } from './middleware/auditMiddleware.js';

const app = express();

// Security: Whitelist CORS origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    const cleanOrigin = origin ? origin.replace(/\/+$/, '') : null;
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not permitted by CORS policy`));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serverless / Container DB connection middleware: ensures MongoDB is connected before querying
app.use(async (req, res, next) => {
  // Allow health checks to respond without blocking
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware warning:', err.message);
    // Proceed so routes with graceful fallbacks can still execute
    next();
  }
});

// Health Check Endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Mess & KFC Express Server Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Realtime broadcast + immutable audit ledger for all state-changing API calls
app.use('/api', realtimeAndAudit);

// Primary API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Safe Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'An internal server error occurred' : (err.message || 'Unknown server error')
  });
});

export default app;
