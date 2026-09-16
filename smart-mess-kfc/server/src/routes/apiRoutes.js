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
  createKfcOrder,
  updateKfcOrderStatus,
  getAIForecast,
  getAIAnomalies,
  getDemoUsers,
  loginUser
} from '../controllers/apiControllers.js';

const router = express.Router();

// Auth Routes
router.get('/auth/demo-users', getDemoUsers);
router.post('/auth/login', loginUser);

// Menu Routes
router.get('/menu/:date', getMenu);
router.post('/menu', updateMenu);

// Selections
router.post('/selections', postSelections);

// Aggregations
router.get('/aggregations/floor/:floorId', getFloorAggregation);
router.get('/aggregations/block/:blockId', getBlockAggregation);
router.get('/aggregations/mess/:date', getMessAggregation);
router.post('/aggregations/:id/flag', flagRoom);

// KFC Orders
router.get('/kfc/orders', getKfcOrders);
router.post('/kfc/orders', createKfcOrder);
router.patch('/kfc/orders/:id/status', updateKfcOrderStatus);

// AI Forecasting & Anomalies
router.get('/ai/forecast/:scope/:date', getAIForecast);
router.get('/ai/anomalies', getAIAnomalies);

export default router;
