import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Mess & KFC Express Server Running' });
});

// Optional MongoDB Connection with graceful fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc';
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('✅ Connected to MongoDB database'))
  .catch((err) => {
    console.log('ℹ️ MongoDB not connected. Running seamlessly with in-memory seed dataset.');
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
