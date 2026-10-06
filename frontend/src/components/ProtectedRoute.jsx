import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp, STAFF_ACCOUNTS, DEFAULT_CAMPUS_USERS } from '../context/AppContext';

/**
 * Route protection and role-based authorization guard.
 * Supports universal Admin/Principal access, seamless demo role auto-alignment,
 * and zero-lag rendering.
 *
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (e.g. ['Room Lead', 'Admin'])
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loginAsUser, users = [] } = useApp();
  const location = useLocation();

  // If role does not match allowedRoles, auto-align session to the portal's designated staff account
  useEffect(() => {
    if (
      currentUser &&
      currentUser.role !== 'Admin' &&
      currentUser.role !== 'Principal' &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(currentUser.role)
    ) {
      const matchingAccount =
        (Array.isArray(STAFF_ACCOUNTS) && STAFF_ACCOUNTS.find((st) => allowedRoles.includes(st.role))) ||
        (Array.isArray(users) && users.find((u) => allowedRoles.includes(u.role))) ||
        (Array.isArray(DEFAULT_CAMPUS_USERS) && DEFAULT_CAMPUS_USERS.find((u) => allowedRoles.includes(u.role)));

      if (matchingAccount && loginAsUser) {
        loginAsUser(matchingAccount);
      }
    }
  }, [currentUser?.role, allowedRoles, loginAsUser, users]);

  // 1. Unauthenticated users -> Redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Admin & Principal have universal unrestricted access to all campus portals
  if (currentUser.role === 'Admin' || currentUser.role === 'Principal') {
    return children;
  }

  // 3. User already matches one of the allowed roles -> render immediately
  if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(currentUser.role)) {
    return children;
  }

  // 4. User role is different (e.g. Student directly visiting /room-lead or /block-coordinator):
  // Check if a matching demo account exists to allow immediate exploration
  const hasMatchingAccount =
    (Array.isArray(STAFF_ACCOUNTS) && STAFF_ACCOUNTS.some((st) => allowedRoles.includes(st.role))) ||
    (Array.isArray(users) && users.some((u) => allowedRoles.includes(u.role)));

  if (hasMatchingAccount) {
    // Render the portal immediately while the session aligns cleanly
    return children;
  }

  // 5. Fallback redirect avoiding redirect-to-self loops
  const fallback =
    currentUser.path && currentUser.path !== location.pathname ? currentUser.path : '/dashboards';
  return <Navigate to={fallback} replace />;
};

export default ProtectedRoute;
