import express from 'express';
import cors from 'cors';
import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();

// Some networks (campus/office) refuse SRV lookups, which breaks mongodb+srv://
// URIs. Allow overriding the resolvers, e.g. DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
}

import apiRoutes from './routes/apiRoutes.js';
import { initRealtime } from './realtime.js';
import { realtimeAndAudit } from './middleware/auditMiddleware.js';
import { sendWeeklyDigest } from './services/digestService.js';
import { User } from './models/Schemas.js';
import { runIdempotentSeed } from './seederService.js';

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Mess & KFC Express Server Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Mess & KFC Express Server Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Realtime broadcast + immutable audit ledger for all state-changing API calls
app.use('/api', realtimeAndAudit);

// Primary API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined endpoints
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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc';
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('✅ Connected to MongoDB database');
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Database is empty. Running initial idempotent seed...');
        await runIdempotentSeed(MONGODB_URI);
        console.log('✅ Initial database seed completed successfully!');
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seed check failed or skipped:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB database:', err.message);
  });

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Realtime gateway (Socket.IO) attached to the HTTP server
initRealtime(server);

// Weekly digest email — every Monday 08:00 by default (cron configurable via DIGEST_CRON)
cron.schedule(process.env.DIGEST_CRON || '0 8 * * 1', () => {
  sendWeeklyDigest().catch((err) => console.error('Weekly digest error:', err.message));
});

// Graceful Shutdown Handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
