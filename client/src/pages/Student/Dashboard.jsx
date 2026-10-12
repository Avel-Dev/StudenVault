import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { AttendanceCard } from '../../components/AttendanceCard';
import { LectureCard } from '../../components/LectureCard';
import { NoteCard } from '../../components/NoteCard';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  CalendarCheck,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [myAttendanceLogs, setMyAttendanceLogs] = useState({});
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const semester = user?.semester || 3;

      // 1. Attendance Summary
      const attRes = await apiFetch(`/attendance/summary`);
      setAttendanceSummary(attRes);

      // 2. Upcoming lectures
      const lecRes = await apiFetch(`/lectures/upcoming?semester=${semester}`);
      setUpcomingLectures(lecRes.lectures || []);

      // 3. Recent notes
      const notesRes = await apiFetch(`/notes?semester=${semester}`);
      setRecentNotes((notesRes.notes || []).slice(0, 3));

      // 4. Student's existing logs to sync button states
      const logsRes = await apiFetch(`/attendance/my-logs?semester=${semester}`);
      const map = {};
      (logsRes.logs || []).forEach((l) => {
        map[l.lecture._id] = l.status;
      });
      setMyAttendanceLogs(map);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.semester]);

  const handleAttendanceChanged = (lectureId, status) => {
    setMyAttendanceLogs((prev) => ({ ...prev, [lectureId]: status }));
    // Refresh attendance summary in background
    apiFetch(`/attendance/summary`)
      .then((res) => setAttendanceSummary(res))
      .catch((e) => console.error(e));
  };

  const handleSyncAllLectures = async () => {
    try {
      setBulkSyncing(true);
      setSyncStatusMsg('');
      const res = await apiFetch('/lectures/sync-all', { method: 'POST' });
      setSyncStatusMsg(res.message);
      // Reload lectures to refresh syncStatus badge
      const lecRes = await apiFetch(`/lectures/upcoming?semester=${user?.semester || 3}`);
      setUpcomingLectures(lecRes.lectures || []);
    } catch (err) {
      setSyncStatusMsg(err.message || 'Calendar sync failed');
    } finally {
      setBulkSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#2F3E4A]/80">Loading your academic vault...</p>
      </div>
    );
  }

  const below75Subjects = (attendanceSummary?.subjects || []).filter((s) => s.isBelow75);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner with Organic Vector Blocks */}
      <div className="relative rounded-3xl bg-[#C0D5C3] p-6 sm:p-8 overflow-hidden shadow-xs border border-[#A5C0A9]">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#D5E4D7]/60 pointer-events-none" />
        <div className="absolute -bottom-20 right-40 w-48 h-48 rounded-full bg-[#E4E4D4]/40 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#E4E4D4] text-xs font-bold text-[#2F3E4A] shadow-xs">
              Semester {user?.semester || 3} Student
            </span>
            <span className="text-xs text-[#2F3E4A]/80 font-medium">
              Academic Year 2026
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#2F3E4A] tracking-tight leading-tight">
            Welcome back, <span className="text-[#8C966D]">{user?.name}</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#2F3E4A]/80 leading-relaxed">
            Your study materials, lecture schedule, and attendance are in order.
            Here is your daily academic overview.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2F3E4A] hover:bg-[#445868] text-[#E4E4D4] font-bold text-xs sm:text-sm shadow-sm transition-lift"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Study Notes</span>
            </Link>

            <button
              onClick={handleSyncAllLectures}
              disabled={bulkSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E4E4D4] hover:bg-white text-[#2F3E4A] font-bold text-xs sm:text-sm border border-[#D6D6C2] shadow-xs transition-lift"
            >
              <CalendarCheck className="w-4 h-4 text-[#8C966D]" />
              <span>{bulkSyncing ? 'Syncing...' : 'Sync Schedule to Google Calendar'}</span>
            </button>
          </div>

          {syncStatusMsg && (
            <p className="mt-3 text-xs font-semibold text-[#2F3E4A] bg-[#E4E4D4]/80 px-3 py-1.5 rounded-xl inline-block">
              {syncStatusMsg}
            </p>
          )}
        </div>
      </div>

      {/* Critical Alert Banner for Subjects Below 75% */}
      {below75Subjects.length > 0 && (
        <div className="rounded-3xl bg-[#F9F7E8] border-2 border-[#D4A93C] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D4A93C]/20 text-[#C48E5A] shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-[#C48E5A]" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#2F3E4A]">
                Attendance Attention Needed in {below75Subjects.length}{' '}
                {below75Subjects.length === 1 ? 'Subject' : 'Subjects'}
              </h3>
              <p className="text-xs text-[#2F3E4A]/80 mt-0.5">
                {below75Subjects.map((s) => `${s.subject.code} (${s.percentage}%)`).join(', ')} is currently below the 75% mandatory threshold.
              </p>
            </div>
          </div>

          <Link
            to="/attendance"
            className="shrink-0 px-4 py-2 rounded-full bg-[#C48E5A] hover:bg-[#B27B47] text-white text-xs font-bold shadow-xs transition-lift flex items-center gap-1.5"
          >
            <span>View Attendance Recovery Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Overall Attendance Stat & Subject Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#2F3E4A]">
              Attendance <span className="text-[#8C966D]">Tracking</span>
            </h2>
            <p className="text-xs text-[#2F3E4A]/70">
              Computed directly via MongoDB aggregation pipeline
            </p>
          </div>
          <Link
            to="/attendance"
            className="text-xs font-bold text-[#8C966D] hover:underline flex items-center gap-1"
          >
            <span>Detailed Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Overall College Summary Card */}
          <div className="rounded-3xl p-5 bg-[#E4E4D4] border border-[#D6D6C2] flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C0D5C3] text-[#2F3E4A]">
                All Subjects
              </span>
              <h3 className="font-heading text-xl font-bold text-[#2F3E4A] mt-2">
                Overall Attendance
              </h3>
              <p className="text-xs text-[#2F3E4A]/70">Semester {user?.semester || 3} Cumulative</p>
            </div>

            <div className="my-4 text-center">
              <span
                className={`font-heading text-5xl font-bold ${
                  attendanceSummary?.overall?.isBelow75 ? 'text-[#C48E5A]' : 'text-[#2F3E4A]'
                }`}
              >
                {attendanceSummary?.overall?.percentage || 0}%
              </span>
              <div className="w-full bg-[#D6D6C2] h-3 rounded-full overflow-hidden mt-3 p-0.5">
                <div
                  className={`h-full rounded-full ${
                    attendanceSummary?.overall?.isBelow75 ? 'bg-[#D4A93C]' : 'bg-[#8C966D]'
                  }`}
                  style={{ width: `${attendanceSummary?.overall?.percentage || 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs bg-[#F4F4EB] p-2.5 rounded-2xl">
              <div>
                <p className="text-[10px] text-[#2F3E4A]/60 uppercase">Attended</p>
                <p className="font-bold text-sm text-[#2F3E4A]">
                  {attendanceSummary?.overall?.attended || 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#2F3E4A]/60 uppercase">Total Conducted</p>
                <p className="font-bold text-sm text-[#2F3E4A]">
                  {attendanceSummary?.overall?.totalLectures || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Subject Cards */}
          {(attendanceSummary?.subjects || []).slice(0, 2).map((summary) => (
            <AttendanceCard key={summary.subject._id} summary={summary} />
          ))}
        </div>
      </div>

      {/* Upcoming Lectures Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#2F3E4A]">
              Upcoming <span className="text-[#8C966D]">Lectures</span>
            </h2>
            <p className="text-xs text-[#2F3E4A]/70">
              Synced with calendar and module study materials
            </p>
          </div>
          <Link
            to="/lectures"
            className="text-xs font-bold text-[#8C966D] hover:underline flex items-center gap-1"
          >
            <span>Full Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingLectures.length === 0 ? (
          <div className="rounded-3xl bg-[#E4E4D4] border border-[#D6D6C2] p-8 text-center text-sm text-[#2F3E4A]/70">
            No upcoming lectures scheduled for this week.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingLectures.slice(0, 3).map((lecture) => (
              <LectureCard
                key={lecture._id}
                lecture={lecture}
                studentAttendance={myAttendanceLogs[lecture._id]}
                onAttendanceChanged={handleAttendanceChanged}
                canMarkAttendance={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Study Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#2F3E4A]">
              Recent <span className="text-[#8C966D]">Notes</span>
            </h2>
            <p className="text-xs text-[#2F3E4A]/70">
              Hand-picked faculty notes and exam revision sheets
            </p>
          </div>
          <Link
            to="/notes"
            className="text-xs font-bold text-[#8C966D] hover:underline flex items-center gap-1"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-3xl bg-[#E4E4D4] border border-[#D6D6C2] p-8 text-center text-sm text-[#2F3E4A]/70">
            No notes uploaded yet for Semester {user?.semester || 3}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
