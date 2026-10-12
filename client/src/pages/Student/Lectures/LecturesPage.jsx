import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../api/client';
import {
  getLocalDateKey,
  getMondayOfWeek,
  getWeekDays,
  formatWeekRangeLabel,
  parseDateKey,
} from './dateUtils';
import { ScheduleToolbar } from './ScheduleToolbar';
import { WeekCalendar } from './WeekCalendar';
import { MiniCalendar } from './MiniCalendar';
import { DayAgenda } from './DayAgenda';
import { LectureDetailPanel } from './LectureDetailPanel';

export const LecturesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data states
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myAttendanceLogs, setMyAttendanceLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bulk sync states
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Mobile mini-calendar collapse state
  const [mobileMiniCalOpen, setMobileMiniCalOpen] = useState(false);

  // Read state from URL search params (Single Source of Truth)
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(today), [today]);
  const defaultMondayKey = useMemo(() => getLocalDateKey(getMondayOfWeek(today)), [today]);

  const weekParam = searchParams.get('week');
  const dayParam = searchParams.get('day');
  const lectureParam = searchParams.get('lecture');
  const subjectParam = searchParams.get('subject') || '';

  // Active dates based on URL or defaults
  const currentWeekMondayKey = weekParam || defaultMondayKey;
  const currentDayKey = dayParam || todayKey;

  // Initialize URL defaults if not present
  useEffect(() => {
    let changed = false;
    const nextParams = new URLSearchParams(searchParams);

    if (!searchParams.get('week')) {
      nextParams.set('week', defaultMondayKey);
      changed = true;
    }
    if (!searchParams.get('day')) {
      nextParams.set('day', todayKey);
      changed = true;
    }

    if (changed) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, defaultMondayKey, todayKey]);

  // Fetch subjects, lectures, and attendance
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const semester = user?.semester || 3;

      // 1. Fetch subjects
      const subjRes = await apiFetch(`/subjects?semester=${semester}`);
      setSubjects(subjRes.subjects || []);

      // 2. Fetch lectures (optionally filtered by subject)
      let query = `?semester=${semester}`;
      if (subjectParam) {
        query += `&subject=${subjectParam}`;
      }
      const lecRes = await apiFetch(`/lectures${query}`);
      setLectures(lecRes.lectures || []);

      // 3. Fetch attendance logs
      const logsRes = await apiFetch(`/attendance/my-logs?semester=${semester}`);
      const map = {};
      (logsRes.logs || []).forEach((l) => {
        map[l.lecture._id] = l.status;
      });
      setMyAttendanceLogs(map);
    } catch (err) {
      console.error('Failed to load lectures data:', err);
      setError(err.message || 'Failed to load lecture schedule.');
    } finally {
      setLoading(false);
    }
  }, [user?.semester, subjectParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Attendance update handler
  const handleAttendanceChanged = (lectureId, status) => {
    setMyAttendanceLogs((prev) => ({ ...prev, [lectureId]: status }));
  };

  // Single lecture calendar sync handler
  const handleCalendarSynced = (lectureId, result) => {
    setLectures((prev) =>
      prev.map((lec) =>
        lec._id === lectureId
          ? { ...lec, syncStatus: 'synced', googleEventId: result.googleEventId }
          : lec
      )
    );
  };

  // Bulk sync handler
  const handleSyncAllLectures = async () => {
    try {
      setBulkSyncing(true);
      setSyncStatusMsg('');
      const res = await apiFetch('/lectures/sync-all', { method: 'POST' });
      setSyncStatusMsg(res.message);
      loadData();
    } catch (err) {
      setSyncStatusMsg(
        err.message || 'Google Calendar sync failed. Check OAuth credentials.'
      );
    } finally {
      setBulkSyncing(false);
    }
  };

  // Pre-calculate lecture dates set for mini calendar indicators
  const lectureDatesSet = useMemo(() => {
    const set = new Set();
    lectures.forEach((lec) => {
      const key = getLocalDateKey(lec.date);
      if (key) set.add(key);
    });
    return set;
  }, [lectures]);

  // Group lectures by local date key
  const lecturesByDay = useMemo(() => {
    const map = {};
    lectures.forEach((lec) => {
      const key = getLocalDateKey(lec.date);
      if (!map[key]) map[key] = [];
      map[key].push(lec);
    });
    return map;
  }, [lectures]);

  // Check if current week has Sunday lecture
  const currentMondayDate = useMemo(() => {
    return parseDateKey(currentWeekMondayKey);
  }, [currentWeekMondayKey]);

  const hasSundayLectureInCurrentWeek = useMemo(() => {
    const sunDate = new Date(currentMondayDate);
    sunDate.setDate(currentMondayDate.getDate() + 6);
    const sunKey = getLocalDateKey(sunDate);
    return (lecturesByDay[sunKey] || []).length > 0;
  }, [currentMondayDate, lecturesByDay]);

  const weekDays = useMemo(() => {
    return getWeekDays(currentMondayDate, hasSundayLectureInCurrentWeek);
  }, [currentMondayDate, hasSundayLectureInCurrentWeek]);

  const weekRangeLabel = useMemo(() => {
    return formatWeekRangeLabel(weekDays);
  }, [weekDays]);

  const isThisWeek = currentWeekMondayKey === defaultMondayKey;

  // URL state update helpers
  const updateURLParam = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handlePrevWeek = () => {
    const prevMon = new Date(currentMondayDate);
    prevMon.setDate(currentMondayDate.getDate() - 7);
    const prevMonKey = getLocalDateKey(prevMon);
    updateURLParam({ week: prevMonKey, day: prevMonKey });
  };

  const handleNextWeek = () => {
    const nextMon = new Date(currentMondayDate);
    nextMon.setDate(currentMondayDate.getDate() + 7);
    const nextMonKey = getLocalDateKey(nextMon);
    updateURLParam({ week: nextMonKey, day: nextMonKey });
  };

  const handleThisWeek = () => {
    updateURLParam({ week: defaultMondayKey, day: todayKey });
  };

  const handleSelectSubject = (subjId) => {
    updateURLParam({ subject: subjId, lecture: '' });
  };

  const handleSelectDay = (dayKey) => {
    updateURLParam({ day: dayKey });
  };

  const handleSelectDateFromMiniCal = (dayKey, mondayKey) => {
    updateURLParam({ day: dayKey, week: mondayKey });
  };

  const handleSelectLecture = (lecId) => {
    updateURLParam({ lecture: lecId });
  };

  const handleCloseLectureDetail = () => {
    updateURLParam({ lecture: '' });
  };

  // Find currently selected lecture for Detail Panel
  const activeLecture = useMemo(() => {
    if (!lectureParam) return null;
    return lectures.find((l) => l._id === lectureParam) || null;
  }, [lectureParam, lectures]);

  // Selected day's lectures for sidebar
  const selectedDayLectures = lecturesByDay[currentDayKey] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* 1. Header & Toolbar */}
      <ScheduleToolbar
        weekRangeLabel={weekRangeLabel}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onThisWeek={handleThisWeek}
        isThisWeek={isThisWeek}
        subjects={subjects}
        selectedSubject={subjectParam}
        onSelectSubject={handleSelectSubject}
        syncStatusMsg={syncStatusMsg}
      />

      {/* 2. Mobile View: Horizontal Day Strip + Collapsible Mini Calendar */}
      <div className="lg:hidden space-y-4">
        {/* Horizontal Week-Day Strip */}
        <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-2xl p-2 flex items-center justify-between gap-1 overflow-x-auto shadow-xs">
          {weekDays.map((d) => {
            const dKey = getLocalDateKey(d);
            const isSelected = dKey === currentDayKey;
            const isToday = dKey === todayKey;
            const hasLec = (lecturesByDay[dKey] || []).length > 0;
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <button
                key={dKey}
                type="button"
                onClick={() => handleSelectDay(dKey)}
                className={`flex-1 min-w-[48px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#C0D5C3] text-[#2F3E4A] font-bold shadow-xs'
                    : isToday
                    ? 'ring-1.5 ring-[#8C966D] text-[#2F3E4A] hover:bg-[#E4E4D4]'
                    : 'text-[#2F3E4A]/80 hover:bg-[#E4E4D4]/60'
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider">{weekday}</span>
                <span className="text-sm font-bold mt-0.5">{d.getDate()}</span>
                {hasLec && (
                  <span
                    className={`w-1 h-1 rounded-full mt-1 ${
                      isSelected ? 'bg-[#2F3E4A]' : 'bg-[#8C966D]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Collapsible Mini Month Calendar for Mobile */}
        <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-2xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setMobileMiniCalOpen((prev) => !prev)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#2F3E4A] hover:bg-[#E4E4D4]/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>Month Calendar & Date Picker</span>
            </span>
            {mobileMiniCalOpen ? (
              <ChevronUp className="w-4 h-4 text-[#2F3E4A]/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#2F3E4A]/60" />
            )}
          </button>
          {mobileMiniCalOpen && (
            <div className="p-3 border-t border-[#D6D6C2]/50">
              <MiniCalendar
                selectedDayKey={currentDayKey}
                onSelectDate={handleSelectDateFromMiniCal}
                lectureDatesSet={lectureDatesSet}
              />
            </div>
          )}
        </div>

        {/* Mobile Agenda List for Selected Day */}
        <DayAgenda
          selectedDayKey={currentDayKey}
          lectures={selectedDayLectures}
          selectedLectureId={lectureParam}
          onSelectLecture={handleSelectLecture}
        />

        {/* Mobile Quick Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSyncAllLectures}
            disabled={bulkSyncing}
            className="flex-1 py-2 px-3 rounded-xl border border-[#D6D6C2] bg-[#FAF9F0] hover:bg-[#C0D5C3]/40 text-xs font-bold text-[#2F3E4A] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#8C966D]" />
            <span>{bulkSyncing ? 'Syncing...' : 'Sync to Google Calendar'}</span>
          </button>
          <button
            type="button"
            onClick={handleThisWeek}
            className="py-2 px-4 rounded-xl border border-[#D6D6C2] bg-[#FAF9F0] hover:bg-[#C0D5C3]/40 text-xs font-bold text-[#2F3E4A] transition-colors shadow-2xs"
          >
            Go to today
          </button>
        </div>
      </div>

      {/* 3. Desktop Two-Column Layout (lg and up) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Weekly Calendar Grid (~75%) */}
        <div className="lg:col-span-9 flex flex-col">
          <WeekCalendar
            days={weekDays}
            lecturesByDay={lecturesByDay}
            selectedLectureId={lectureParam}
            onSelectLecture={handleSelectLecture}
            onSelectDay={handleSelectDay}
            loading={loading}
            error={error}
            onRetry={loadData}
          />
        </div>

        {/* Right Column: Sticky Sidebar (~25%) */}
        <div className="lg:col-span-3 sticky top-4 space-y-4">
          {/* 1. Mini Month Calendar */}
          <MiniCalendar
            selectedDayKey={currentDayKey}
            onSelectDate={handleSelectDateFromMiniCal}
            lectureDatesSet={lectureDatesSet}
          />

          {/* 2. Selected Day Agenda */}
          <DayAgenda
            selectedDayKey={currentDayKey}
            lectures={selectedDayLectures}
            selectedLectureId={lectureParam}
            onSelectLecture={handleSelectLecture}
          />

          {/* 3. Quick Actions (Max 2, quiet outline styling) */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleSyncAllLectures}
              disabled={bulkSyncing}
              className="w-full py-2 px-3 rounded-xl border border-[#D6D6C2] bg-[#FAF9F0] hover:bg-[#C0D5C3]/40 text-xs font-semibold text-[#2F3E4A] transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>{bulkSyncing ? 'Syncing...' : 'Sync to Google Calendar'}</span>
            </button>
            <button
              type="button"
              onClick={handleThisWeek}
              className="w-full py-2 px-3 rounded-xl border border-[#D6D6C2] bg-[#FAF9F0] hover:bg-[#C0D5C3]/40 text-xs font-semibold text-[#2F3E4A] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Go to today</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Lecture Detail Modal/Sheet */}
      {activeLecture && (
        <LectureDetailPanel
          lecture={activeLecture}
          studentAttendance={myAttendanceLogs[activeLecture._id]}
          onAttendanceChanged={handleAttendanceChanged}
          onCalendarSynced={handleCalendarSynced}
          onClose={handleCloseLectureDetail}
        />
      )}
    </div>
  );
};
