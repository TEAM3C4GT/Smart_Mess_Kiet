import mongoose from 'mongoose';
import dns from 'node:dns';
import { User } from './models/Schemas.js';
import { runIdempotentSeed } from './seederService.js';

// Some networks (campus/office) refuse SRV lookups, which breaks mongodb+srv://
// URIs. Allow overriding the resolvers, e.g. DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
}

let cachedPromise = null;

/**
 * Connect to MongoDB with connection caching for serverless (Vercel)
 * and long-running server environments.
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cachedPromise) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc';
    cachedPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    }).then(async (m) => {
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
      return m;
    }).catch((err) => {
      cachedPromise = null;
      console.error('❌ Failed to connect to MongoDB database:', err.message);
      throw err;
    });
  }

  return cachedPromise;
}
