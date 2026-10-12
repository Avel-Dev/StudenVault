import React, { useMemo } from 'react';
import { parseDateKey, parseTimeMinutes } from './dateUtils';

export const DayAgenda = ({
  selectedDayKey,
  lectures = [],
  selectedLectureId,
  onSelectLecture,
}) => {
  const dayLabel = useMemo(() => {
    if (!selectedDayKey) return 'Today';
    const parsed = parseDateKey(selectedDayKey);
    return parsed.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDayKey]);

  // Sort lectures by start time
  const sortedLectures = useMemo(() => {
    return [...lectures].sort(
      (a, b) => parseTimeMinutes(a.startTime) - parseTimeMinutes(b.startTime)
    );
  }, [lectures]);

  return (
    <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-[#D6D6C2]/50 pb-2">
        <h4 className="font-heading text-xs font-bold text-[#2F3E4A]">
          {dayLabel}
        </h4>
        <span className="text-[10px] font-mono text-[#8C966D] font-bold">
          {sortedLectures.length} {sortedLectures.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      {sortedLectures.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-[#2F3E4A]/50 italic">No lectures this day</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedLectures.map((lec) => {
            const isSelected = selectedLectureId === lec._id;
            return (
              <button
                key={lec._id}
                type="button"
                onClick={() => onSelectLecture(lec._id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#C0D5C3]/40 border-[#8C966D] shadow-xs'
                    : 'bg-[#F4F4EB]/60 border-[#D6D6C2]/60 hover:bg-[#E4E4D4]/70 hover:border-[#A9B28C]/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] leading-tight mb-0.5">
                    <span className="font-mono font-bold text-[#2F3E4A]">
                      {lec.startTime}
                    </span>
                    <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-[#2F3E4A]/10 text-[#2F3E4A] font-semibold">
                      {lec.subject?.code}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#2F3E4A] truncate">
                    {lec.topic}
                  </p>
                </div>
                {lec.room && (
                  <span className="text-[10px] text-[#2F3E4A]/60 font-mono shrink-0 pl-1">
                    {lec.room}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
