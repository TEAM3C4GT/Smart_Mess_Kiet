import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { MainDashboards } from './pages/MainDashboards';
import { StudentDashboard } from './pages/StudentDashboard';
import { RoomLeadDashboard } from './pages/RoomLeadDashboard';
import { FloorInchargeDashboard } from './pages/FloorInchargeDashboard';
import { BlockCoordinatorDashboard } from './pages/BlockCoordinatorDashboard';
import { MessInchargeDashboard } from './pages/MessInchargeDashboard';
import { PrincipalDashboard } from './pages/PrincipalDashboard';
import { KfcStaffDashboard } from './pages/KfcStaffDashboard';
import { ToastContainer } from './components/ToastContainer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatWidget } from './components/ChatWidget';

export const App = () => {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Switchboard & Portals Directory */}
        <Route path="/dashboards" element={<MainDashboards />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['Student', 'Room Lead', 'Admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room-lead"
          element={
            <ProtectedRoute allowedRoles={['Room Lead', 'Admin']}>
              <RoomLeadDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/floor-incharge"
          element={
            <ProtectedRoute allowedRoles={['Floor Incharge', 'Admin']}>
              <FloorInchargeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/block-coordinator"
          element={
            <ProtectedRoute allowedRoles={['Block Coordinator', 'Admin']}>
              <BlockCoordinatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mess-incharge"
          element={
            <ProtectedRoute allowedRoles={['Mess Incharge', 'Admin']}>
              <MessInchargeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/principal"
          element={
            <ProtectedRoute allowedRoles={['Principal', 'Admin']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kfc-staff"
          element={
            <ProtectedRoute allowedRoles={['KFC Staff', 'Admin']}>
              <KfcStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kfc"
          element={
            <ProtectedRoute allowedRoles={['KFC Staff', 'Admin']}>
              <KfcStaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ChatWidget />
    </ErrorBoundary>
  );
};

export default App;
