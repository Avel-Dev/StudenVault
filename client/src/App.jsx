import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { StudentDashboard } from './pages/Student/Dashboard';
import { NotesLibrary } from './pages/Student/NotesLibrary';
import { StudentLectures } from './pages/Student/Lectures';
import { StudentAttendance } from './pages/Student/Attendance';
import { AdminPlaceholder } from './pages/Admin/AdminPlaceholder';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/notes" element={<NotesLibrary />} />
            <Route path="/lectures" element={<StudentLectures />} />
            <Route path="/attendance" element={<StudentAttendance />} />
            <Route path="/admin" element={<AdminPlaceholder />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
