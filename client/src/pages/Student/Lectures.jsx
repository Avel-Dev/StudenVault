import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { LectureCard } from '../../components/LectureCard';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const StudentLectures = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [myAttendanceLogs, setMyAttendanceLogs] = useState({});
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const semester = user?.semester || 3;

      // 1. Fetch subjects
      const subjRes = await apiFetch(`/subjects?semester=${semester}`);
      setSubjects(subjRes.subjects || []);

      // 2. Fetch lectures
      let query = `?semester=${semester}`;
      if (selectedSubject) query += `&subject=${selectedSubject}`;
      const lecRes = await apiFetch(`/lectures${query}`);
      setLectures(lecRes.lectures || []);

      // 3. Fetch attendance logs for student
      const logsRes = await apiFetch(`/attendance/my-logs?semester=${semester}`);
      const map = {};
      (logsRes.logs || []).forEach((l) => {
        map[l.lecture._id] = l.status;
      });
      setMyAttendanceLogs(map);
    } catch (err) {
      console.error('Error loading lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.semester, selectedSubject]);

  const handleAttendanceChanged = (lectureId, status) => {
    setMyAttendanceLogs((prev) => ({ ...prev, [lectureId]: status }));
  };

  const handleCalendarSynced = (lectureId, result) => {
    setLectures((prev) =>
      prev.map((lec) =>
        lec._id === lectureId
          ? { ...lec, syncStatus: 'synced', googleEventId: result.googleEventId }
          : lec
      )
    );
  };

  const handleSyncAllLectures = async () => {
    try {
      setBulkSyncing(true);
      setSyncStatusMsg('');
      const res = await apiFetch('/lectures/sync-all', { method: 'POST' });
      setSyncStatusMsg(res.message);
      // Reload lectures to refresh syncStatus badges
      loadData();
    } catch (err) {
      setSyncStatusMsg(err.message || 'Google Calendar sync failed. Check OAuth credentials.');
    } finally {
      setBulkSyncing(false);
    }
  };

  // Filter lectures based on viewFilter
  const now = new Date();
  const filteredLectures = lectures.filter((lec) => {
    const lectureDate = new Date(lec.date);
    if (viewFilter === 'upcoming') {
      return lectureDate >= now;
    }
    if (viewFilter === 'past') {
      return lectureDate < now;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Google Calendar Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <Calendar className="w-4 h-4 text-[#2F3E4A]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C966D]">
              Timetable & Log
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
            Lectures & <span className="text-[#8C966D]">Schedule</span>
          </h1>
          <p className="text-sm text-[#2F3E4A]/70 mt-1">
            Track daily class progress, topics covered, and sync directly to Google Calendar
          </p>
        </div>

        {/* Sync All Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            onClick={handleSyncAllLectures}
            disabled={bulkSyncing}
            className="px-5 py-2.5 rounded-full bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold shadow-xs transition-lift flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{bulkSyncing ? 'Syncing...' : 'Sync Schedule to Google Calendar'}</span>
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="p-3.5 rounded-2xl bg-[#C0D5C3]/40 border border-[#A9B28C]/60 text-xs font-semibold text-[#2F3E4A]">
          {syncStatusMsg}
        </div>
      )}

      {/* Filter and Tab Bar */}
      <div className="bg-[#E4E4D4] rounded-3xl p-4 border border-[#D6D6C2] flex flex-wrap items-center justify-between gap-4">
        {/* Timeline View Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewFilter === 'all'
                ? 'bg-[#2F3E4A] text-white shadow-xs'
                : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#C0D5C3]'
            }`}
          >
            All Lectures ({lectures.length})
          </button>
          <button
            onClick={() => setViewFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewFilter === 'upcoming'
                ? 'bg-[#2F3E4A] text-white shadow-xs'
                : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#C0D5C3]'
            }`}
          >
            Upcoming Only
          </button>
          <button
            onClick={() => setViewFilter('past')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewFilter === 'past'
                ? 'bg-[#2F3E4A] text-white shadow-xs'
                : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#C0D5C3]'
            }`}
          >
            Past Conducted
          </button>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#2F3E4A]/70">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#F4F4EB] border border-[#D6D6C2] rounded-full px-3 py-1.5 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lectures Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#2F3E4A]/70">Loading lecture schedule...</p>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="rounded-3xl bg-[#E4E4D4] border border-[#D6D6C2] p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-8 h-8 text-[#8C966D] mx-auto" />
          <h3 className="font-heading text-lg font-bold text-[#2F3E4A]">No Lectures Found</h3>
          <p className="text-xs text-[#2F3E4A]/70 leading-relaxed">
            There are no lectures matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLectures.map((lecture) => (
            <LectureCard
              key={lecture._id}
              lecture={lecture}
              studentAttendance={myAttendanceLogs[lecture._id]}
              onAttendanceChanged={handleAttendanceChanged}
              onCalendarSynced={handleCalendarSynced}
              canMarkAttendance={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
