import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateKey, parseDateKey, getMondayOfWeek } from './dateUtils';

export const MiniCalendar = ({
  selectedDayKey,
  onSelectDate,
  lectureDatesSet = new Set(),
}) => {
  // Current viewed month state in mini calendar
  const [viewDate, setViewDate] = useState(() => {
    return selectedDayKey ? parseDateKey(selectedDayKey) : new Date();
  });

  // Keep viewed month synced when selectedDayKey changes drastically
  useEffect(() => {
    if (selectedDayKey) {
      const parsed = parseDateKey(selectedDayKey);
      setViewDate((prev) => {
        if (
          parsed.getMonth() !== prev.getMonth() ||
          parsed.getFullYear() !== prev.getFullYear()
        ) {
          return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
        }
        return prev;
      });
    }
  }, [selectedDayKey]);

  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);

  const monthYearLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate matrix of days for the month
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // Leading empty days from prev month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      cells.push({
        date: d,
        key: getLocalDateKey(d),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cur = new Date(year, month, d);
      cells.push({
        date: cur,
        key: getLocalDateKey(cur),
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month to fill complete 6 rows (42 cells) or 5 rows (35 cells)
    const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextD = new Date(year, month + 1, i);
      cells.push({
        date: nextD,
        key: getLocalDateKey(nextD),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewDate]);

  const handleCellClick = (cell) => {
    const monday = getMondayOfWeek(cell.date);
    const mondayKey = getLocalDateKey(monday);
    onSelectDate(cell.key, mondayKey);
  };

  return (
    <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-4 shadow-xs select-none">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-heading text-xs font-bold text-[#2F3E4A]">
          {monthYearLabel}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#2F3E4A]/70 hover:text-[#2F3E4A] hover:bg-[#E4E4D4] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#2F3E4A]/70 hover:text-[#2F3E4A] hover:bg-[#E4E4D4] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels (Sun to Sat) */}
      <div className="grid grid-cols-7 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[10px] font-mono text-[#2F3E4A]/40 font-semibold py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {calendarCells.map((cell) => {
          const isSelected = cell.key === selectedDayKey;
          const isToday = cell.key === todayKey;
          const hasLecture = lectureDatesSet.has(cell.key);

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => handleCellClick(cell)}
              className={`relative h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-[#C0D5C3] text-[#2F3E4A] font-bold shadow-xs'
                  : isToday
                  ? 'ring-1.5 ring-[#8C966D] text-[#2F3E4A] font-bold hover:bg-[#E4E4D4]'
                  : cell.isCurrentMonth
                  ? 'text-[#2F3E4A] hover:bg-[#E4E4D4]/70'
                  : 'text-[#2F3E4A]/25 hover:bg-[#E4E4D4]/40'
              }`}
            >
              <span>{cell.date.getDate()}</span>
              {/* Dot indicator if lectures exist on this date */}
              {hasLecture && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-[#2F3E4A]' : 'bg-[#8C966D]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
