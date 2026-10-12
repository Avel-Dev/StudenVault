import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Sparkles, ArrowRight, Lock, Mail, GraduationCap } from 'lucide-react';

export const Login = () => {
  const { login, switchDemoRole, isDev } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      setLoading(true);
      setError('');
      const user = await switchDemoRole(role);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-[#C0D5C3] items-center justify-center text-[#2F3E4A] mb-3 shadow-sm">
            <BookOpen className="w-7 h-7 text-[#2F3E4A]" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
            Study<span className="text-[#8C966D]">Vault</span>
          </h1>
          <p className="text-sm text-[#2F3E4A]/70 mt-1">
            A calm, organized space for your lectures, notes & attendance
          </p>
        </div>

        {/* Development Quick-Switch Box */}
        {isDev && (
          <div className="mb-6 bg-[#C0D5C3]/40 border border-[#A9B28C]/60 rounded-3xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2F3E4A] mb-2.5">
              <Sparkles className="w-4 h-4 text-[#C48E5A]" />
              <span>Instant Demo Access (Development Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                disabled={loading}
                className="py-2.5 px-3 rounded-full bg-[#E4E4D4] hover:bg-white text-[#2F3E4A] text-xs font-bold border border-[#D6D6C2] shadow-xs transition-lift"
              >
                🎓 Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="py-2.5 px-3 rounded-full bg-[#2F3E4A] hover:bg-[#445868] text-[#E4E4D4] text-xs font-bold shadow-xs transition-lift"
              >
                🛡️ Faculty Admin
              </button>
            </div>
          </div>
        )}

        {/* Standard Login Form */}
        <div className="bg-[#E4E4D4] rounded-3xl p-6 sm:p-8 border border-[#D6D6C2] shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#C48E5A]/20 border border-[#C48E5A]/40 text-[#2F3E4A] text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F3E4A] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#2F3E4A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@studyvault.edu"
                  className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3E4A] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#2F3E4A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#C48E5A] hover:bg-[#B27B47] text-white font-bold text-sm shadow-sm transition-lift flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to StudyVault'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#D6D6C2] text-center text-xs text-[#2F3E4A]/70">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-bold text-[#8C966D] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
