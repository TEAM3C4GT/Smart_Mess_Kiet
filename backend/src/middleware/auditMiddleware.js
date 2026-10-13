import { AuditLog } from '../models/AuditLog.js';
import { emitChange } from '../realtime.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const REDACT_KEYS = ['password', 'token', 'newPassword', 'confirmPassword', 'currentPassword'];

const resourceFor = (originalUrl = '') => {
  const clean = originalUrl.replace(/^\/api\//, '').split('?')[0];
  const seg = clean.split('/')[0] || 'root';
  if (seg === 'kfc') {
    if (clean.includes('/orders')) return 'kfc-orders';
    if (clean.includes('/menu')) return 'kfc-menu';
    return 'kfc';
  }
  if (seg === 'floor-requisitions' || seg === 'requisitions') return 'requisitions';
  return seg;
};

const sanitize = (body) => {
  if (!body || typeof body !== 'object') return undefined;
  const clone = Array.isArray(body) ? [...body] : { ...body };
  if (!Array.isArray(clone)) {
    REDACT_KEYS.forEach((k) => {
      if (k in clone) clone[k] = '[redacted]';
    });
  }
  try {
    const serialized = JSON.stringify(clone);
    if (serialized.length > 4000) {
      return { note: 'payload too large to store', keys: Array.isArray(clone) ? '[array]' : Object.keys(clone) };
    }
    return clone;
  } catch {
    return undefined;
  }
};

/**
 * Records every state-changing API request in the immutable audit ledger and
 * broadcasts a realtime change event so connected dashboards can refresh.
 */
export const realtimeAndAudit = (req, res, next) => {
  res.on('finish', () => {
    if (!MUTATING_METHODS.has(req.method)) return;

    const resource = resourceFor(req.originalUrl || req.url || '');
    const success = res.statusCode >= 200 && res.statusCode < 300;

    if (success) {
      try {
        emitChange(resource, { method: req.method });
      } catch (e) {}
    }

    try {
      AuditLog.create({
        actorId: req.user?.id || req.user?.rollNo || null,
        actorName: req.user?.name || null,
        actorRole: req.user?.role || null,
        method: req.method,
        path: req.originalUrl || req.url,
        resource,
        status: res.statusCode,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
        meta: sanitize(req.body)
      }).catch(() => {});
    } catch (e) {}
  });

  next();
};

export default realtimeAndAudit;
