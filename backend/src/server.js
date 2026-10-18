import app from './app.js';
import { connectDB } from './db.js';
import { initRealtime } from './realtime.js';
import { sendWeeklyDigest } from './services/digestService.js';
import cron from 'node-cron';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB on startup
connectDB().catch((err) => {
  console.error('Initial DB connection failed:', err.message);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
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
