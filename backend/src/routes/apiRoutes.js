import express from 'express';
import {
  getMenu,
  updateMenu,
  postSelections,
  getFloorAggregation,
  getBlockAggregation,
  getMessAggregation,
  flagRoom,
  getKfcOrders,
  clearKfcOrders,
  createKfcOrder,
  updateKfcOrderStatus,
  getKfcMenu,
  addKfcMenuItem,
  updateKfcMenu,
  deleteKfcMenuItem,
  getAIForecast,
  getAIHistoricalData,
  simulateAIForecast,
  getAIAnomalies,
  getDemoUsers,
  loginUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRooms,
  getStudents,
  getAttendance,
  runSeederApi,
  getSeederStatus
} from '../controllers/apiControllers.js';

const router = express.Router();

// Auth Routes
router.get('/auth/demo-users', getDemoUsers);
router.post('/auth/login', loginUser);

// User Management Routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Rooms, Students & Attendance Routes (Direct MongoDB Queries)
router.get('/rooms', getRooms);
router.get('/students', getStudents);
router.get('/attendance', getAttendance);

// Seeder Management Routes
router.post('/seeder/run', runSeederApi);
router.get('/seeder/status', getSeederStatus);

// Menu Routes
router.get('/menu', getMenu);
router.get('/menu/:date', getMenu);
router.post('/menu', updateMenu);
router.put('/menu', updateMenu);

// Selections
router.post('/selections', postSelections);

// Aggregations
router.get('/aggregations/floor/:floorId', getFloorAggregation);
router.get('/aggregations/block/:blockId', getBlockAggregation);
router.get('/aggregations/mess/:date', getMessAggregation);
router.post('/aggregations/:id/flag', flagRoom);

// KFC Menu
router.get('/kfc/menu', getKfcMenu);
router.post('/kfc/menu', addKfcMenuItem);
router.put('/kfc/menu', updateKfcMenu);
router.delete('/kfc/menu/:id', deleteKfcMenuItem);

// KFC Orders
router.get('/kfc/orders', getKfcOrders);
router.delete('/kfc/orders', clearKfcOrders);
router.post('/kfc/orders', createKfcOrder);
router.patch('/kfc/orders/:id/status', updateKfcOrderStatus);

// AI Forecasting & Anomalies
router.get('/ai/forecast/:scope/:date', getAIForecast);
router.get('/ai/historical', getAIHistoricalData);
router.post('/ai/simulate', simulateAIForecast);
router.get('/ai/anomalies', getAIAnomalies);

export default router;
