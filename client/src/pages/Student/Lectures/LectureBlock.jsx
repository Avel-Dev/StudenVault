import React from 'react';
import { getSubjectAccent, parseTimeMinutes } from './dateUtils';

export const LectureBlock = ({
  lecture,
  top,
  height,
  colIndex = 0,
  totalCols = 1,
  isSelected = false,
  isPast = false,
  onClick,
}) => {
  const accent = getSubjectAccent(lecture.subject?.code);
  const duration = parseTimeMinutes(lecture.endTime) - parseTimeMinutes(lecture.startTime);
  const isCompact = height < 56 || duration <= 45;

  const widthStyle = totalCols > 1
    ? `calc((100% - ${(totalCols - 1) * 4}px) / ${totalCols})`
    : 'calc(100% - 6px)';
  const leftStyle = totalCols > 1
    ? `calc(${colIndex} * ((100% - ${(totalCols - 1) * 4}px) / ${totalCols} + 4px) + 3px)`
    : '3px';

  const accessibleName = `${lecture.subject?.code || 'Lecture'}: ${lecture.topic}. Time: ${lecture.startTime} to ${lecture.endTime}. Room: ${lecture.room || 'unspecified'}.`;

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      aria-label={accessibleName}
      title={`${lecture.subject?.code}: ${lecture.topic} (${lecture.startTime} - ${lecture.endTime}, ${lecture.room || ''})`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        top: `${top}px`,
        height: `${Math.max(height - 2, 28)}px`,
        left: leftStyle,
        width: widthStyle,
      }}
      className={`absolute z-10 text-left p-2 rounded-md border border-l-[3.5px] transition-all select-none overflow-hidden flex flex-col justify-between cursor-pointer shadow-[0_1px_3px_rgba(47,62,74,0.05)] ${accent.bg} ${accent.border} ${accent.accentBorder} ${
        isPast ? 'opacity-80' : 'opacity-100'
      } ${
        isSelected
          ? 'ring-2 ring-[#2F3E4A] ring-offset-1 ring-offset-[#FAF9F0] z-20 shadow-md'
          : 'hover:shadow-md hover:brightness-98 hover:scale-[1.008]'
      }`}
    >
      <div className="min-w-0 w-full overflow-hidden">
        {/* Row 1: Time & Course Code */}
        <div className="flex items-center justify-between gap-1 text-[11px] leading-tight mb-0.5">
          <span className="font-mono font-bold tracking-tight text-[#2F3E4A]">
            {lecture.startTime}–{lecture.endTime}
          </span>
          <span className="font-mono font-semibold px-1 py-0.2 rounded text-[10px] bg-[#2F3E4A]/10 text-[#2F3E4A]">
            {lecture.subject?.code}
          </span>
        </div>

        {/* Row 2: Topic Title */}
        <p className="text-xs font-semibold text-[#2F3E4A] truncate leading-tight">
          {lecture.topic}
        </p>
      </div>

      {/* Row 3: Room (drops off first if block is short) */}
      {!isCompact && lecture.room && (
        <div className="text-[10px] text-[#2F3E4A]/65 truncate font-medium mt-auto pt-0.5">
          {lecture.room}
        </div>
      )}
    </button>
  );
};
