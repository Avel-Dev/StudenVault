import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E4D4]">
        <div className="w-12 h-12 rounded-full border-4 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#E4E4D4] text-[#2F3E4A] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[#D6D6C2] py-6 px-4 text-center text-xs text-[#2F3E4A]/60">
        <p>StudyVault Academic Knowledge & Lecture Tracking System • Built for College Students</p>
      </footer>
    </div>
  );
};
