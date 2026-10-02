import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Route protection and role-based authorization guard.
 *
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (e.g. ['Student', 'Admin'])
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, addToast } = useApp();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      addToast('Please sign in to access this portal.', 'warning');
    } else if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      currentUser.role !== 'Admin' &&
      !allowedRoles.includes(currentUser.role)
    ) {
      addToast(
        `Access denied: Your account role (${currentUser.role}) does not have permission for this portal.`,
        'error'
      );
    }
  }, [currentUser, allowedRoles, location.pathname]);

  // 1. Unauthenticated users -> Redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based authorization: Admin has universal access; others must match allowedRoles
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    currentUser.role !== 'Admin' &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return <Navigate to={currentUser.path || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
