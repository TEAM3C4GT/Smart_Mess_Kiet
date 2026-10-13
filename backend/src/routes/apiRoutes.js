import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getMenu,
  updateMenu,
  postSelections,
  getStudentSelection,
  getStudentMealHistory,
  getFloorAggregation,
  getBlockAggregation,
  getMessAggregation,
  flagRoom,
  getKfcOrders,
  getStudentKfcOrders,
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
  switchUserToken,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRooms,
  getRoomMembers,
  updateRoomMemberMeal,
  getStudents,
  getAttendance,
  saveAttendance,
  getFloorAttendance,
  saveRoomAttendance,
  getNotifications,
  createNotification,
  markNotificationRead,
  clearNotifications,
  getFloorRequisitions,
  createFloorRequisition,
  getDietaryRequests,
  createDietaryRequest,
  getPrincipalAnalytics,
  getWastageAnalytics,
  getBlockPerformance,
  runSeederApi,
  getSeederStatus
} from '../controllers/apiControllers.js';

import { postChat, postChatExecute } from '../controllers/chatController.js';
import { getAuditLogs, runWeeklyDigest } from '../controllers/systemControllers.js';

import {
  authenticateToken,
  optionalAuth,
  requireRole,
  enforceStudentOwnership,
  devOrAdminOnly
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiter for authentication attempts (Brute force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: process.env.NODE_ENV === 'production' ? 15 : 200, // 15 in prod, 200 in dev/test
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Rate limiter for the Mess Guide chat assistant
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: process.env.NODE_ENV === 'production' ? 30 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many Mess Guide requests. Please slow down and try again shortly.'
  }
});

/* ==========================================================================
   AUTHENTICATION & USER MANAGEMENT
   ========================================================================== */
router.get('/auth/demo-users', getDemoUsers);
router.post('/auth/login', loginLimiter, loginUser);
router.post('/auth/switch-token', switchUserToken);
router.get('/users', authenticateToken, requireRole(['Admin', 'Principal']), getUsers);
router.post('/users', authenticateToken, requireRole(['Admin']), createUser);
router.put('/users/:id', authenticateToken, requireRole(['Admin']), updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['Admin']), deleteUser);

/* ==========================================================================
   ROOMS, STUDENTS & ATTENDANCE
   ========================================================================== */
router.get('/rooms', authenticateToken, requireRole(['Room Lead', 'Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getRooms);
router.get('/rooms/:roomNo/members', authenticateToken, getRoomMembers);
router.post('/rooms/:roomNo/members/:studentId/meal', authenticateToken, requireRole(['Room Lead', 'Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), updateRoomMemberMeal);
router.get('/students', authenticateToken, getStudents);
router.get('/attendance', optionalAuth, getAttendance);
router.post('/attendance', authenticateToken, requireRole(['Mess Incharge', 'Admin']), saveAttendance);
router.get('/attendance/floor/:floorId', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getFloorAttendance);
router.post('/attendance/room/:roomNo', authenticateToken, requireRole(['Room Lead', 'Floor Incharge', 'Block Coordinator', 'Admin', 'Principal']), saveRoomAttendance);

/* ==========================================================================
   NOTIFICATIONS
   ========================================================================== */
router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications', authenticateToken, requireRole(['Room Lead', 'Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), createNotification);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);
router.delete('/notifications', authenticateToken, requireRole(['Admin', 'Principal']), clearNotifications);

/* ==========================================================================
   REQUISITIONS & DIETARY REQUESTS
   ========================================================================== */
router.get('/requisitions/floor', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getFloorRequisitions);
router.post('/requisitions/floor', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Admin', 'Principal']), createFloorRequisition);
router.get('/floor-requisitions', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getFloorRequisitions);
router.post('/floor-requisitions', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Admin', 'Principal']), createFloorRequisition);
router.get('/dietary-requests', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getDietaryRequests);
router.post('/dietary-requests', authenticateToken, requireRole(['Room Lead', 'Floor Incharge', 'Block Coordinator', 'Student', 'Admin', 'Principal']), enforceStudentOwnership('studentRoll'), createDietaryRequest);

/* ==========================================================================
   MENU & SELECTIONS (WITH STUDENT OWNERSHIP GUARDS)
   ========================================================================== */
router.get('/menu', optionalAuth, getMenu);
router.get('/menu/:date', optionalAuth, getMenu);
router.post('/menu', authenticateToken, requireRole(['Mess Incharge', 'Admin']), updateMenu);
router.put('/menu', authenticateToken, requireRole(['Mess Incharge', 'Admin']), updateMenu);
router.post('/selections', authenticateToken, enforceStudentOwnership('studentId'), postSelections);
router.get('/selections/history/:studentId', authenticateToken, enforceStudentOwnership('studentId'), getStudentMealHistory);
router.get('/selections/:studentId/:date', authenticateToken, enforceStudentOwnership('studentId'), getStudentSelection);

/* ==========================================================================
   HIERARCHY AGGREGATIONS & ANALYTICS
   ========================================================================== */
router.get('/aggregations/floor/:floorId', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getFloorAggregation);
router.get('/aggregations/block/:blockId', authenticateToken, requireRole(['Block Coordinator', 'Mess Incharge', 'Admin', 'Principal']), getBlockAggregation);
router.get('/aggregations/mess/:date', authenticateToken, requireRole(['Mess Incharge', 'Admin', 'Principal', 'Block Coordinator']), getMessAggregation);
router.post('/aggregations/:id/flag', authenticateToken, requireRole(['Floor Incharge', 'Block Coordinator', 'Admin', 'Principal']), flagRoom);
router.get('/analytics/principal', authenticateToken, requireRole(['Principal', 'Admin']), getPrincipalAnalytics);
router.get('/analytics/wastage', authenticateToken, requireRole(['Mess Incharge', 'Admin', 'Principal']), getWastageAnalytics);
router.get('/analytics/block-performance', authenticateToken, requireRole(['Mess Incharge', 'Block Coordinator', 'Admin', 'Principal']), getBlockPerformance);
router.get('/performance/blocks', authenticateToken, requireRole(['Mess Incharge', 'Block Coordinator', 'Admin', 'Principal']), getBlockPerformance);

/* ==========================================================================
   KFC MENU
   ========================================================================== */
router.get('/kfc/menu', optionalAuth, getKfcMenu);
router.post('/kfc/menu', authenticateToken, requireRole(['KFC Staff', 'Admin']), addKfcMenuItem);
router.put('/kfc/menu', authenticateToken, requireRole(['KFC Staff', 'Admin']), updateKfcMenu);
router.delete('/kfc/menu/:id', authenticateToken, requireRole(['KFC Staff', 'Admin']), deleteKfcMenuItem);

/* ==========================================================================
   KFC ORDERS (WITH STUDENT OWNERSHIP GUARDS)
   ========================================================================== */
router.get('/kfc/orders', authenticateToken, getKfcOrders);
router.get('/kfc/orders/student/:rollNo', authenticateToken, enforceStudentOwnership('rollNo'), getStudentKfcOrders);
router.delete('/kfc/orders', authenticateToken, requireRole(['KFC Staff', 'Admin']), clearKfcOrders);
router.post('/kfc/orders', authenticateToken, enforceStudentOwnership('studentRoll'), createKfcOrder);
router.patch('/kfc/orders/:id/status', authenticateToken, (req, res, next) => {
  if ((req.body.feedback || req.body.rating) && !req.body.status) return next();
  if (req.body.status === 'Cancelled') return next();
  return requireRole(['KFC Staff', 'Admin'])(req, res, next);
}, updateKfcOrderStatus);

/* ==========================================================================
   AI FORECASTING & ANOMALIES
   ========================================================================== */
router.get('/ai/forecast/:scope/:date', optionalAuth, getAIForecast);
router.get('/ai/historical', optionalAuth, getAIHistoricalData);
router.get('/ai/historical-data', optionalAuth, getAIHistoricalData);
router.get('/attendance/historical', optionalAuth, getAIHistoricalData);
router.post('/ai/simulate', authenticateToken, requireRole(['Mess Incharge', 'Principal', 'Admin']), simulateAIForecast);
router.get('/ai/anomalies', authenticateToken, requireRole(['Mess Incharge', 'Principal', 'Admin']), getAIAnomalies);

/* ==========================================================================
   MESS GUIDE CHAT ASSISTANT (proxied to the Python AI microservice)
   ========================================================================== */
router.post('/chat', optionalAuth, chatLimiter, postChat);
router.post('/chat/execute', authenticateToken, chatLimiter, postChatExecute);

/* ==========================================================================
   SEEDER MANAGEMENT (DEV / ADMIN ONLY)
   ========================================================================== */
router.post('/seeder/run', authenticateToken, devOrAdminOnly, runSeederApi);
router.get('/seeder/status', authenticateToken, requireRole(['Admin', 'Principal']), getSeederStatus);

/* ==========================================================================
   SYSTEM — AUDIT LEDGER & WEEKLY DIGEST
   ========================================================================== */
router.get('/audit-logs', authenticateToken, requireRole(['Admin', 'Principal']), getAuditLogs);
router.post('/digest/run', authenticateToken, requireRole(['Admin']), runWeeklyDigest);

export default router;
