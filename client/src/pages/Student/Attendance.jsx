import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { AttendanceCard } from '../../components/AttendanceCard';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'logs'
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [sumRes, logsRes] = await Promise.all([
        apiFetch('/attendance/summary'),
        apiFetch(`/attendance/my-logs?semester=${user?.semester || 3}`),
      ]);
      setSummary(sumRes);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [user?.semester]);

  // Student logs/edits self-attendance for a lecture (Adjustment #1)
  const handleToggleAttendance = async (lectureId, newStatus) => {
    try {
      setUpdatingId(lectureId);
      await apiFetch('/attendance/log-self', {
        method: 'POST',
        body: JSON.stringify({ lectureId, status: newStatus }),
      });

      // Update local logs state immediately
      setLogs((prev) =>
        prev.map((log) =>
          log.lecture._id === lectureId
            ? { ...log, status: newStatus, markedBy: 'student', updatedAt: new Date().toISOString() }
            : log
        )
      );

      // Re-fetch MongoDB aggregation summary to update percentages live!
      const updatedSummary = await apiFetch('/attendance/summary');
      setSummary(updatedSummary);
    } catch (err) {
      console.error('Failed to log attendance:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#2F3E4A]/80">Aggregating attendance records...</p>
      </div>
    );
  }

  const below75 = (summary?.subjects || []).filter((s) => s.isBelow75);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <CheckCircle2 className="w-4 h-4 text-[#2F3E4A]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C966D]">
              Academic Progress
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
            Attendance <span className="text-[#8C966D]">Tracker</span>
          </h1>
          <p className="text-sm text-[#2F3E4A]/70 mt-1">
            Mandatory college threshold is 75%. Log and verify your presence per class.
          </p>
        </div>

        {/* Tab Toggle: Overview vs Detailed Logs */}
        <div className="flex items-center bg-[#D6D6C2]/60 p-1 rounded-full self-start md:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#2F3E4A] text-white shadow-xs'
                : 'text-[#2F3E4A] hover:bg-[#C0D5C3]/40'
            }`}
          >
            Subject Overview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-[#2F3E4A] text-white shadow-xs'
                : 'text-[#2F3E4A] hover:bg-[#C0D5C3]/40'
            }`}
          >
            Class-by-Class Log ({logs.length})
          </button>
        </div>
      </div>

      {/* Prominent Below 75% Warning Section */}
      {below75.length > 0 && (
        <div className="rounded-3xl bg-[#F9F7E8] border-2 border-[#D4A93C] p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#D4A93C]/20 text-[#C48E5A] shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#C48E5A]" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#2F3E4A]">
                Attention: Attendance Shortage in {below75.length}{' '}
                {below75.length === 1 ? 'Subject' : 'Subjects'}
              </h2>
              <p className="text-xs sm:text-sm text-[#2F3E4A]/80 mt-1 leading-relaxed">
                College regulations require at least 75% attendance to qualify for semester examinations.
                Check below for target attendance needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {below75.map((s) => (
              <div
                key={s.subject._id}
                className="bg-[#E4E4D4] rounded-2xl p-3.5 border border-[#D4A93C]/60 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#8C966D]">{s.subject.code}</span>
                  <p className="text-xs font-bold text-[#2F3E4A] truncate max-w-[150px]">
                    {s.subject.name}
                  </p>
                  <p className="text-[11px] text-[#C48E5A] font-semibold mt-1 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>Attend +{s.lecturesNeededFor75} classes</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-[#C48E5A]">
                    {s.percentage}%
                  </span>
                  <p className="text-[10px] text-[#2F3E4A]/60">
                    {s.attended}/{s.totalLectures}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 1: Subject Overview Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(summary?.subjects || []).map((subjSummary) => (
              <AttendanceCard key={subjSummary.subject._id} summary={subjSummary} />
            ))}
          </div>

          {/* Aggregation Explanation Note */}
          <div className="rounded-3xl bg-[#C0D5C3]/30 border border-[#A9B28C]/40 p-4 flex items-start gap-3 text-xs text-[#2F3E4A]/80">
            <Info className="w-4 h-4 text-[#8C966D] shrink-0 mt-0.5" />
            <p>
              Attendance percentages are calculated in real time using a MongoDB aggregation pipeline:
              Total Attended ÷ Total Conducted Classes per Subject. You can self-log or edit attendance for any lecture in the <strong>Class-by-Class Log</strong> tab.
            </p>
          </div>
        </div>
      )}

      {/* View 2: Class-by-Class Interactive Log (Adjustment #1) */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-[#E4E4D4] rounded-3xl border border-[#D6D6C2] overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-[#D6D6C2] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#2F3E4A]">
                  Student Attendance Log
                </h3>
                <p className="text-xs text-[#2F3E4A]/70">
                  Click 'Present' or 'Absent' on any lecture to update your attendance status.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#D6D6C2]/60">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#2F3E4A]/70">
                  No lecture records found for Semester {user?.semester || 3}.
                </div>
              ) : (
                logs.map((log) => {
                  const lec = log.lecture;
                  const isUpdating = updatingId === lec._id;
                  const dateStr = new Date(lec.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={lec._id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F4F4EB]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C0D5C3] text-[#2F3E4A]">
                            {lec.subject?.code}
                          </span>
                          <span className="text-xs text-[#2F3E4A]/70 font-medium">
                            {lec.day}, {dateStr}
                          </span>
                          <span className="text-[11px] text-[#2F3E4A]/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{lec.startTime}</span>
                          </span>
                          {log.markedBy && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D6D6C2] text-[#2F3E4A]/80 font-semibold">
                              {log.markedBy === 'student' ? 'Self Logged' : 'Faculty Marked'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-heading text-base font-bold text-[#2F3E4A]">
                          {lec.topic}
                        </h4>

                        <p className="text-xs text-[#2F3E4A]/70">
                          {lec.subject?.name}
                          {lec.room ? ` • ${lec.room}` : ''}
                        </p>
                      </div>

                      {/* Interactive Present/Absent Toggle (Adjustment #1) */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleAttendance(lec._id, 'present')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            log.status === 'present'
                              ? 'bg-[#8C966D] text-white shadow-xs'
                              : 'bg-[#C0D5C3]/40 text-[#2F3E4A] hover:bg-[#C0D5C3]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleAttendance(lec._id, 'absent')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            log.status === 'absent'
                              ? 'bg-[#C48E5A] text-white shadow-xs'
                              : 'bg-[#E4E4D4] border border-[#D6D6C2] text-[#2F3E4A] hover:bg-[#C48E5A]/20'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
