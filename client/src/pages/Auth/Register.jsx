import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ArrowRight, Lock, Mail, User, GraduationCap } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [semester, setSemester] = useState(3);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role: 'student',
        semester: Number(semester),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-[#C0D5C3] items-center justify-center text-[#2F3E4A] mb-3 shadow-sm">
            <BookOpen className="w-7 h-7 text-[#2F3E4A]" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
            Create Account
          </h1>
          <p className="text-sm text-[#2F3E4A]/70 mt-1">
            Join StudyVault to organize your studies and lectures
          </p>
        </div>

        <div className="bg-[#E4E4D4] rounded-3xl p-6 sm:p-8 border border-[#D6D6C2] shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#C48E5A]/20 border border-[#C48E5A]/40 text-[#2F3E4A] text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F3E4A] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#2F3E4A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] transition-colors"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3E4A] uppercase tracking-wider mb-1.5">
                Current Semester
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-[#2F3E4A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#8C966D] hover:bg-[#788258] text-white font-bold text-sm shadow-sm transition-lift flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Join StudyVault'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#D6D6C2] text-center text-xs text-[#2F3E4A]/70">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-[#8C966D] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
