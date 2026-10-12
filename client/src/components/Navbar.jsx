import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchDemoRole, isDev, updateSemester } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleRoleToggle = async () => {
    if (!isDev || switchingRole) return;
    try {
      setSwitchingRole(true);
      const nextRole = user?.role === 'admin' ? 'student' : 'admin';
      await switchDemoRole(nextRole);
      if (nextRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const navLinks = user?.role === 'admin'
    ? [
        { label: 'Admin Portal', path: '/admin', icon: LayoutDashboard },
        { label: 'Student View', path: '/dashboard', icon: BookOpen },
        { label: 'Notes Library', path: '/notes', icon: Layers },
        { label: 'Schedule', path: '/lectures', icon: Calendar },
      ]
    : [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Study Library', path: '/notes', icon: BookOpen },
        { label: 'Lectures', path: '/lectures', icon: Calendar },
        { label: 'Attendance', path: '/attendance', icon: CheckCircle2 },
      ];

  return (
    <header className="sticky top-0 z-40 bg-[#E4E4D4]/95 backdrop-blur-md border-b border-[#D6D6C2]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Two-Tone Typography */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A] shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#2F3E4A]" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-[#2F3E4A]">
              Study<span className="text-[#8C966D]">Vault</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#C0D5C3] text-[#2F3E4A] shadow-sm font-semibold'
                      : 'text-[#2F3E4A]/80 hover:bg-[#D5E4D7]/50 hover:text-[#2F3E4A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Semester Switcher for Students */}
            {user?.role === 'student' && (
              <div className="flex items-center gap-1.5 bg-[#D6D6C2]/50 px-2.5 py-1 rounded-full text-xs font-medium text-[#2F3E4A]">
                <span>Sem</span>
                <select
                  value={user.semester || 3}
                  onChange={(e) => updateSemester(Number(e.target.value))}
                  className="bg-transparent font-bold text-[#2F3E4A] cursor-pointer focus:outline-none"
                  aria-label="Select Current Semester"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-[#E4E4D4]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Development-only Quick Role Switcher (Adjustment #3) */}
            {isDev && (
              <button
                onClick={handleRoleToggle}
                disabled={switchingRole}
                title="Toggle between Student and Admin mode (Dev only)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#A9B28C]/30 text-[#2F3E4A] hover:bg-[#A9B28C]/50 transition-lift border border-[#A9B28C]/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C48E5A]" />
                <span>
                  {switchingRole
                    ? 'Switching...'
                    : user?.role === 'admin'
                    ? 'Faculty Admin'
                    : 'Student Mode'}
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-[#2F3E4A]/10 px-1.5 py-0.5 rounded-md text-[#2F3E4A]">
                  Dev
                </span>
              </button>
            )}

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#D6D6C2]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#2F3E4A] truncate max-w-[120px]">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] text-[#2F3E4A]/70 capitalize">
                  {user?.role === 'admin' ? 'Faculty Admin' : `Sem ${user?.semester || 3}`}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="w-9 h-9 rounded-full bg-[#C0D5C3]/60 hover:bg-[#C48E5A]/20 flex items-center justify-center text-[#2F3E4A] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isDev && (
              <button
                onClick={handleRoleToggle}
                className="text-xs px-2.5 py-1 rounded-full bg-[#A9B28C]/30 font-medium"
              >
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#2F3E4A] hover:bg-[#C0D5C3]/50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#E4E4D4] border-b border-[#D6D6C2] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-base font-medium ${
                  active
                    ? 'bg-[#C0D5C3] text-[#2F3E4A] font-bold'
                    : 'text-[#2F3E4A]/80 hover:bg-[#D5E4D7]/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#D6D6C2] flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-[#2F3E4A]">{user?.name}</p>
              <p className="text-[#2F3E4A]/70">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-sm font-semibold text-[#C48E5A] px-3 py-1.5 rounded-full hover:bg-[#C48E5A]/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
