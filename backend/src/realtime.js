import { Server } from 'socket.io';

let io = null;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

export const initRealtime = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const cleanOrigin = origin ? origin.replace(/\/+$/, '') : null;
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error(`Origin '${origin}' not permitted by CORS policy`));
        }
      },
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.emit('realtime:ready', { ts: Date.now() });
  });

  console.log('⚡ Socket.IO realtime gateway initialised');
  return io;
};

export const emitChange = (resource, payload = {}) => {
  if (!io) return;
  io.emit('data:changed', { resource, ...payload, ts: Date.now() });
};

export const emitToRoom = (room, event, payload = {}) => {
  if (!io) return;
  io.to(room).emit(event, { ...payload, ts: Date.now() });
};

export const getIO = () => io;
