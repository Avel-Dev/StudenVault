import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CalendarCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Layers,
  Download,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const LectureCard = ({
  lecture,
  studentAttendance,
  onAttendanceChanged,
  onCalendarSynced,
  canMarkAttendance = true,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [loggingAtt, setLoggingAtt] = useState(false);

  const formattedDate = new Date(lecture.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isPast = new Date(lecture.date) < new Date();

  // Handle student-side logging of attendance (Adjustment #1)
  const handleMarkSelfAttendance = async (newStatus) => {
    try {
      setLoggingAtt(true);
      await apiFetch('/attendance/log-self', {
        method: 'POST',
        body: JSON.stringify({
          lectureId: lecture._id,
          status: newStatus,
        }),
      });
      if (onAttendanceChanged) {
        onAttendanceChanged(lecture._id, newStatus);
      }
    } catch (err) {
      console.error('Failed to log attendance:', err);
    } finally {
      setLoggingAtt(false);
    }
  };

  // Handle Google Calendar sync / retry button (Adjustment #5)
  const handleSyncCalendar = async () => {
    try {
      setSyncing(true);
      setSyncError(null);
      const res = await apiFetch(`/lectures/${lecture._id}/sync-calendar`, {
        method: 'POST',
      });
      if (onCalendarSynced) {
        onCalendarSynced(lecture._id, res);
      }
    } catch (err) {
      setSyncError(err.message || 'Calendar sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-[#E4E4D4]/90 rounded-3xl p-5 border border-[#D6D6C2] hover:border-[#A9B28C] transition-lift shadow-xs">
      {/* Top Header: Date, Time & Calendar Sync Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0D5C3] text-[#2F3E4A] font-bold text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#2F3E4A]" />
            <span>{lecture.day}, {formattedDate}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-[#2F3E4A]/70 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{lecture.startTime} - {lecture.endTime}</span>
          </span>
        </div>

        {/* Google Calendar Sync Pill & Retry Action (Adjustment #5) */}
        <div className="flex items-center gap-1.5">
          {lecture.syncStatus === 'synced' ? (
            <span
              title="Synced to Google Calendar"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#A9B28C]/30 text-[#2F3E4A]"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>G-Cal Synced</span>
            </span>
          ) : (
            <button
              onClick={handleSyncCalendar}
              disabled={syncing}
              title={syncError || 'Sync lecture to Google Calendar'}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D6D6C2]/70 hover:bg-[#C0D5C3] text-[#2F3E4A] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync G-Cal'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject and Topic */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#8C966D] uppercase">
            {lecture.subject?.code}
          </span>
          <span className="text-xs text-[#2F3E4A]/60">• {lecture.subject?.name}</span>
          {lecture.room && (
            <span className="flex items-center gap-1 text-[11px] text-[#2F3E4A]/60 ml-auto">
              <MapPin className="w-3 h-3" />
              <span>{lecture.room}</span>
            </span>
          )}
        </div>

        <h3 className="font-heading text-lg font-bold text-[#2F3E4A] leading-snug">
          {lecture.topic}
        </h3>

        {lecture.module && (
          <p className="text-xs text-[#2F3E4A]/70 mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#8C966D]" />
            <span>Module {lecture.module.number}: {lecture.module.title}</span>
          </p>
        )}
      </div>

      {/* Linked Study Notes */}
      {lecture.notes && lecture.notes.length > 0 && (
        <div className="mb-4 pt-3 border-t border-[#D6D6C2]/60">
          <p className="text-[11px] font-bold text-[#2F3E4A]/70 uppercase tracking-wider mb-2">
            Attached Study Materials:
          </p>
          <div className="flex flex-wrap gap-2">
            {lecture.notes.map((note) => (
              <a
                key={note._id}
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0D5C3]/60 hover:bg-[#C0D5C3] text-xs font-medium text-[#2F3E4A] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#8C966D]" />
                <span className="truncate max-w-[180px]">{note.title}</span>
                <Download className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Student Attendance Logger (Adjustment #1) */}
      {canMarkAttendance && (
        <div className="pt-3 border-t border-[#D6D6C2]/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#2F3E4A]/70 font-medium">My Attendance:</span>
            {studentAttendance === 'present' && (
              <span className="font-bold text-[#2F3E4A] bg-[#C0D5C3] px-2 py-0.5 rounded-full text-[11px]">
                Present
              </span>
            )}
            {studentAttendance === 'absent' && (
              <span className="font-bold text-[#C48E5A] bg-[#C48E5A]/20 px-2 py-0.5 rounded-full text-[11px]">
                Absent
              </span>
            )}
            {(!studentAttendance || studentAttendance === 'not_marked') && (
              <span className="text-[#2F3E4A]/50 text-[11px] italic">Not yet logged</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleMarkSelfAttendance('present')}
              disabled={loggingAtt}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                studentAttendance === 'present'
                  ? 'bg-[#8C966D] text-white shadow-xs'
                  : 'bg-[#C0D5C3]/50 text-[#2F3E4A] hover:bg-[#C0D5C3]'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Present</span>
            </button>
            <button
              onClick={() => handleMarkSelfAttendance('absent')}
              disabled={loggingAtt}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
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
      )}
    </div>
  );
};
