import { AuditLog } from '../models/AuditLog.js';
import { sendWeeklyDigest } from '../services/digestService.js';

export const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 500);
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching audit logs', error: err.message });
  }
};

export const runWeeklyDigest = async (req, res) => {
  try {
    const result = await sendWeeklyDigest();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Weekly digest generation failed', error: err.message });
  }
};
