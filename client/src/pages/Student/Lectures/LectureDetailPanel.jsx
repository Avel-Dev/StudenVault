import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Layers,
  FileText,
  Download,
  CalendarCheck,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../../api/client';
import { getSubjectAccent } from './dateUtils';

export const LectureDetailPanel = ({
  lecture,
  studentAttendance,
  onAttendanceChanged,
  onCalendarSynced,
  onClose,
}) => {
  const [loggingAtt, setLoggingAtt] = useState(false);
  const [syncingCal, setSyncingCal] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const panelRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!lecture) return null;

  const accent = getSubjectAccent(lecture.subject?.code);

  const formattedDate = new Date(lecture.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleMarkAttendance = async (status) => {
    try {
      setLoggingAtt(true);
      await apiFetch('/attendance/log-self', {
        method: 'POST',
        body: JSON.stringify({
          lectureId: lecture._id,
          status,
        }),
      });
      if (onAttendanceChanged) {
        onAttendanceChanged(lecture._id, status);
      }
    } catch (err) {
      console.error('Failed to log attendance:', err);
    } finally {
      setLoggingAtt(false);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      setSyncingCal(true);
      setSyncError(null);
      const res = await apiFetch(`/lectures/${lecture._id}/sync-calendar`, {
        method: 'POST',
      });
      if (onCalendarSynced) {
        onCalendarSynced(lecture._id, res);
      }
    } catch (err) {
      setSyncError(err.message || 'Google Calendar sync failed');
    } finally {
      setSyncingCal(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lecture-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2F3E4A]/30 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="w-full sm:max-w-lg bg-[#FAF9F0] border border-[#D6D6C2] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Top bar: Subject badge, close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${accent.badge}`}
            >
              {lecture.subject?.code}
            </span>
            <span className="text-xs font-semibold text-[#2F3E4A]/70 truncate max-w-[240px]">
              {lecture.subject?.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#2F3E4A]/60 hover:text-[#2F3E4A] hover:bg-[#E4E4D4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div>
          <h3
            id="lecture-detail-title"
            className="font-heading text-xl font-bold text-[#2F3E4A] leading-snug"
          >
            {lecture.topic}
          </h3>
          {lecture.module && (
            <p className="text-xs text-[#8C966D] font-semibold mt-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>
                Module {lecture.module.number}: {lecture.module.title}
              </span>
            </p>
          )}
        </div>

        {/* Date, Time, Room meta chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#2F3E4A]">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4E4D4]/70 border border-[#D6D6C2]/60">
            <Calendar className="w-3.5 h-3.5 text-[#8C966D]" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4E4D4]/70 border border-[#D6D6C2]/60 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#8C966D]" />
            <span>
              {lecture.startTime} – {lecture.endTime}
            </span>
          </span>
          {lecture.room && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4E4D4]/70 border border-[#D6D6C2]/60">
              <MapPin className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>{lecture.room}</span>
            </span>
          )}
        </div>

        {/* Attached Study Materials */}
        <div className="pt-3 border-t border-[#D6D6C2]/60">
          <p className="text-[11px] font-bold text-[#2F3E4A]/70 uppercase tracking-wider mb-2">
            Study Materials
          </p>
          {lecture.notes && lecture.notes.length > 0 ? (
            <div className="space-y-1.5">
              {lecture.notes.map((note) => (
                <a
                  key={note._id}
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#E4E4D4]/50 border border-[#D6D6C2]/60 hover:bg-[#C0D5C3]/40 text-xs font-medium text-[#2F3E4A] transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-[#8C966D] shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#2F3E4A]/50 group-hover:text-[#2F3E4A] shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#2F3E4A]/50 italic">
              No study materials attached to this lecture.
            </p>
          )}
        </div>

        {/* Student Attendance Logger */}
        <div className="pt-3 border-t border-[#D6D6C2]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#2F3E4A]/70 font-medium">My Attendance:</span>
            {studentAttendance === 'present' && (
              <span className="font-bold text-[#2F3E4A] bg-[#C0D5C3] px-2.5 py-0.5 rounded-full text-[11px]">
                Present
              </span>
            )}
            {studentAttendance === 'absent' && (
              <span className="font-bold text-[#C48E5A] bg-[#C48E5A]/20 px-2.5 py-0.5 rounded-full text-[11px]">
                Absent
              </span>
            )}
            {(!studentAttendance || studentAttendance === 'not_marked') && (
              <span className="text-[#2F3E4A]/50 text-[11px] italic">Not yet logged</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAttendance('present')}
              disabled={loggingAtt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                studentAttendance === 'present'
                  ? 'bg-[#8C966D] text-white shadow-xs'
                  : 'bg-[#C0D5C3]/60 text-[#2F3E4A] hover:bg-[#C0D5C3]'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Present</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkAttendance('absent')}
              disabled={loggingAtt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                studentAttendance === 'absent'
                  ? 'bg-[#C48E5A] text-white shadow-xs'
                  : 'bg-[#E4E4D4] border border-[#D6D6C2] text-[#2F3E4A] hover:bg-[#C48E5A]/20'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Absent</span>
            </button>
          </div>
        </div>

        {/* Google Calendar Sync Action */}
        <div className="pt-3 border-t border-[#D6D6C2]/60 flex items-center justify-between text-xs">
          <span className="text-[#2F3E4A]/70 font-medium">Google Calendar:</span>
          {lecture.syncStatus === 'synced' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A9B28C]/30 text-[#2F3E4A] font-semibold text-xs">
              <CalendarCheck className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>Synced</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSyncCalendar}
              disabled={syncingCal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4E4D4] border border-[#D6D6C2] hover:bg-[#C0D5C3]/50 text-[#2F3E4A] font-semibold transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${syncingCal ? 'animate-spin' : ''}`} />
              <span>{syncingCal ? 'Syncing...' : 'Sync to Calendar'}</span>
            </button>
          )}
        </div>

        {syncError && (
          <p className="text-[11px] text-[#C48E5A] bg-[#C48E5A]/10 p-2 rounded-xl">
            {syncError}
          </p>
        )}
      </div>
    </div>
  );
};
