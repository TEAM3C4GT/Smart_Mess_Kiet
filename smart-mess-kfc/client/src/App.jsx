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

export const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboards" element={<MainDashboards />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/room-lead" element={<RoomLeadDashboard />} />
        <Route path="/floor-incharge" element={<FloorInchargeDashboard />} />
        <Route path="/block-coordinator" element={<BlockCoordinatorDashboard />} />
        <Route path="/mess-incharge" element={<MessInchargeDashboard />} />
        <Route path="/principal" element={<PrincipalDashboard />} />
        <Route path="/kfc-staff" element={<KfcStaffDashboard />} />
        <Route path="/kfc" element={<KfcStaffDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
