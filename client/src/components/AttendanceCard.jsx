import React from 'react';
import { AlertCircle, CheckCircle, Flame, ShieldAlert, Award } from 'lucide-react';

export const AttendanceCard = ({ summary }) => {
  const {
    subject,
    totalLectures,
    attended,
    missed,
    percentage,
    isBelow75,
    lecturesNeededFor75,
    safeToMiss,
  } = summary;

  return (
    <div
      className={`rounded-3xl p-5 border transition-lift relative overflow-hidden ${
        isBelow75
          ? 'bg-[#F9F7E8] border-[#D4A93C] shadow-sm'
          : 'bg-[#C0D5C3]/40 border-[#A9B28C]/50 hover:bg-[#C0D5C3]/60'
      }`}
    >
      {/* Visual Indicator Banner for Low Attendance */}
      {isBelow75 && (
        <div className="absolute top-0 right-0 bg-[#D4A93C] text-[#2F3E4A] font-bold text-[11px] px-3 py-1 rounded-bl-2xl flex items-center gap-1 shadow-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Below 75% Target</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#2F3E4A]/10 text-[#2F3E4A] mb-1.5">
            {subject.code}
          </span>
          <h3 className="font-heading text-lg font-bold text-[#2F3E4A] line-clamp-1">
            {subject.name}
          </h3>
          <p className="text-xs text-[#2F3E4A]/70">Semester {subject.semester}</p>
        </div>

        {/* Circular Percentage Dial */}
        <div className="text-right">
          <span
            className={`font-heading text-3xl font-bold ${
              isBelow75 ? 'text-[#C48E5A]' : 'text-[#2F3E4A]'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Chunky Progress Track */}
      <div className="w-full bg-[#E4E4D4] h-3.5 rounded-full overflow-hidden p-0.5 mb-4 border border-[#D6D6C2]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isBelow75
              ? 'bg-[#D4A93C]'
              : percentage >= 85
              ? 'bg-[#8C966D]'
              : 'bg-[#A9B28C]'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {/* Stats Counter Breakdown */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-[#E4E4D4]/70 mb-3 text-center text-xs">
        <div>
          <p className="text-[10px] text-[#2F3E4A]/60 uppercase font-semibold">Attended</p>
          <p className="font-bold text-sm text-[#2F3E4A]">{attended}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#2F3E4A]/60 uppercase font-semibold">Missed</p>
          <p className="font-bold text-sm text-[#C48E5A]">{missed}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#2F3E4A]/60 uppercase font-semibold">Conducted</p>
          <p className="font-bold text-sm text-[#2F3E4A]">{totalLectures}</p>
        </div>
      </div>

      {/* Smart Advice / Buffer Calculation */}
      <div className="text-xs pt-1">
        {isBelow75 ? (
          <p className="text-[#C48E5A] font-medium flex items-center gap-1.5">
            <Flame className="w-4 h-4 shrink-0" />
            <span>Must attend <strong>{lecturesNeededFor75}</strong> more continuous {lecturesNeededFor75 === 1 ? 'lecture' : 'lectures'} to restore 75%.</span>
          </p>
        ) : safeToMiss > 0 ? (
          <p className="text-[#2F3E4A]/80 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#8C966D] shrink-0" />
            <span>Safe margin: you can miss up to <strong>{safeToMiss}</strong> {safeToMiss === 1 ? 'class' : 'classes'}.</span>
          </p>
        ) : (
          <p className="text-[#2F3E4A]/80 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#8C966D] shrink-0" />
            <span>At the 75% boundary. Attend the next lecture to stay safe.</span>
          </p>
        )}
      </div>
    </div>
  );
};
