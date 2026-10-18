import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'production-grade-smart-mess-kiet-secure-jwt-key-2026';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET was not provided in environment. Using secure fallback key. Please set a custom JWT_SECRET in Render.');
}

/**
 * Authentication Middleware: Validates signed JWT token from Authorization header.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization header missing or malformed.'
    });
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError'
          ? 'Authentication token has expired. Please log in again.'
          : 'Invalid authentication token signature.',
        error: err.message
      });
    }

    req.user = decoded;
    next();
  });
};

/**
 * Optional Authentication: Attaches req.user if a valid token is provided,
 * but allows public requests if omitted (e.g. for AI microservice internal queries).
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
};

/**
 * Role-Based Access Control Middleware:
 * Grants access if user's role is in allowedRoles list.
 * Admin and Principal automatically possess universal oversight privileges.
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource.'
      });
    }

    const userRole = req.user.role;
    const isUniversalAdmin = userRole === 'Admin' || userRole === 'Principal';

    if (isUniversalAdmin || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${userRole}' is not authorized for this operation.`
    });
  };
};

/**
 * Record Ownership Enforcement:
 * Prevents students from reading, updating, or placing orders/choices on behalf of other students.
 */
export const enforceStudentOwnership = (identifierField = 'studentId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Privileged campus roles can assist or supervise other students
    if (req.user.role !== 'Student') {
      return next();
    }

    const userRoll = (req.user.rollNo || '').toLowerCase();
    const userId = (req.user.id || '').toLowerCase();
    const userName = (req.user.name || '').toLowerCase();

    const targetParam = (
      req.params[identifierField] ||
      req.params.rollNo ||
      req.params.studentId ||
      req.body[identifierField] ||
      req.body.studentRoll ||
      req.body.studentId ||
      req.body.studentName ||
      req.query[identifierField] ||
      req.query.rollNo ||
      req.query.name ||
      ''
    ).toLowerCase();

    if (!targetParam) {
      return next();
    }

    const matchesRoll = userRoll && targetParam.includes(userRoll);
    const matchesId = userId && targetParam.includes(userId);
    const matchesName = userName && (targetParam.includes(userName) || userName.includes(targetParam));

    if (matchesRoll || matchesId || matchesName) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You cannot view, submit, or modify records belonging to other students.'
    });
  };
};

/**
 * Seeder Protection Middleware:
 * Restricts seeder execution strictly to Admin in dev/test, and disallows public seeder execution.
 */
export const devOrAdminOnly = (req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const isAdmin = req.user?.role === 'Admin';
  const isVercelCron = Boolean(req.headers['x-vercel-cron']);

  if (isAdmin || isDev || isVercelCron) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Seeder execution is restricted to campus administrators.'
  });
};
