import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
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

export const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboards"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <MainDashboards />
            </ProtectedRoute>
          }
        />
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
    </>
  );
};

export default App;
