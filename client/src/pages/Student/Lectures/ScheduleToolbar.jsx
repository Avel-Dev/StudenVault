import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const ScheduleToolbar = ({
  weekRangeLabel,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  isThisWeek,
  subjects = [],
  selectedSubject = '',
  onSelectSubject,
  syncStatusMsg = '',
}) => {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
            <Calendar className="w-3.5 h-3.5 text-[#2F3E4A]" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C966D]">
            Timetable & Schedule
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2F3E4A]">
          Lectures & <span className="text-[#8C966D]">Schedule</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#2F3E4A]/70 mt-0.5">
          Weekly timetable, module topics covered, and Google Calendar synchronization
        </p>
      </div>

      {/* Sync Status Banner if any */}
      {syncStatusMsg && (
        <div className="p-3 rounded-2xl bg-[#C0D5C3]/40 border border-[#A9B28C]/60 text-xs font-semibold text-[#2F3E4A]">
          {syncStatusMsg}
        </div>
      )}

      {/* Toolbar Row */}
      <div className="bg-[#FAF9F0] rounded-2xl p-2.5 sm:p-3 border border-[#D6D6C2] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left: Week Navigator [<] Date Range [>] and [This Week] */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#E4E4D4]/70 border border-[#D6D6C2] rounded-xl p-0.5">
            <button
              type="button"
              onClick={onPrevWeek}
              aria-label="Previous week"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2F3E4A]/70 hover:text-[#2F3E4A] hover:bg-[#FAF9F0] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-[#2F3E4A] select-none whitespace-nowrap">
              {weekRangeLabel}
            </span>
            <button
              type="button"
              onClick={onNextWeek}
              aria-label="Next week"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2F3E4A]/70 hover:text-[#2F3E4A] hover:bg-[#FAF9F0] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onThisWeek}
            disabled={isThisWeek}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isThisWeek
                ? 'bg-[#E4E4D4]/40 border-[#D6D6C2] text-[#2F3E4A]/40 cursor-default'
                : 'bg-[#FAF9F0] border-[#D6D6C2] hover:bg-[#C0D5C3]/50 text-[#2F3E4A] shadow-2xs cursor-pointer'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Right: Subject Dropdown Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#2F3E4A]/70">
            <Filter className="w-3.5 h-3.5 text-[#8C966D]" />
            <span className="font-semibold hidden sm:inline">Subject:</span>
          </div>
          <select
            id="subject-filter-select"
            aria-label="Filter by subject"
            value={selectedSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} – {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
