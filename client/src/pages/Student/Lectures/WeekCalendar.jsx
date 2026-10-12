import React, { useMemo } from 'react';
import {
  getLocalDateKey,
  parseTimeMinutes,
  layoutDayLectures,
} from './dateUtils';
import { LectureBlock } from './LectureBlock';

const HOUR_HEIGHT = 68; // px per hour

export const WeekCalendar = ({
  days,
  lecturesByDay,
  selectedLectureId,
  onSelectLecture,
  onSelectDay,
  loading = false,
  error = null,
  onRetry,
}) => {
  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);

  // Compute dynamic hour bounds across the displayed week's lectures
  const { startHour, endHour, hourSlots } = useMemo(() => {
    let minMinutes = 9 * 60; // 09:00 default
    let maxMinutes = 17 * 60; // 17:00 default

    days.forEach((day) => {
      const dayKey = getLocalDateKey(day);
      const dayList = lecturesByDay[dayKey] || [];
      dayList.forEach((lec) => {
        const s = parseTimeMinutes(lec.startTime);
        const e = parseTimeMinutes(lec.endTime);
        if (s < minMinutes) minMinutes = s;
        if (e > maxMinutes) maxMinutes = e;
      });
    });

    // Pad by 1 hour either side, bound within 07:00 and 21:00
    const start = Math.max(7, Math.floor(minMinutes / 60) - 1);
    const end = Math.min(21, Math.ceil(maxMinutes / 60) + 1);

    const slots = [];
    for (let h = start; h < end; h++) {
      slots.push(h);
    }
    return { startHour: start, endHour: end, hourSlots: slots };
  }, [days, lecturesByDay]);

  // Total count of lectures in the week
  const totalLecturesCount = useMemo(() => {
    return days.reduce((acc, day) => {
      const dayKey = getLocalDateKey(day);
      return acc + (lecturesByDay[dayKey]?.length || 0);
    }, 0);
  }, [days, lecturesByDay]);

  // Current time position for the "now" indicator
  const nowIndicator = useMemo(() => {
    const now = new Date();
    const currentKey = getLocalDateKey(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      const top = ((currentMinutes - startMinutes) / 60) * HOUR_HEIGHT;
      return { dayKey: currentKey, top };
    }
    return null;
  }, [startHour, endHour]);

  const numCols = days.length;

  if (error) {
    return (
      <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-12 h-12 rounded-full bg-[#C48E5A]/20 text-[#C48E5A] flex items-center justify-center font-bold mb-3">
          !
        </div>
        <h3 className="font-heading text-lg font-bold text-[#2F3E4A]">Failed to load schedule</h3>
        <p className="text-xs text-[#2F3E4A]/70 max-w-sm mt-1 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs"
          >
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl overflow-hidden shadow-xs flex flex-col flex-1 min-h-[580px]">
      {/* Calendar Header: Day Columns */}
      <div
        className="grid border-b border-[#D6D6C2] bg-[#FAF9F0] sticky top-0 z-20"
        style={{
          gridTemplateColumns: `56px repeat(${numCols}, minmax(0, 1fr))`,
        }}
      >
        {/* Time gutter header cell */}
        <div className="border-r border-[#D6D6C2]/60 py-3 px-2 text-center text-[10px] font-mono text-[#2F3E4A]/40 uppercase tracking-wider">
          Time
        </div>

        {/* Day header cells */}
        {days.map((day) => {
          const dayKey = getLocalDateKey(day);
          const isToday = dayKey === todayKey;
          const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = day.getDate();

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onSelectDay(dayKey)}
              className={`py-3 px-2 text-center border-r border-[#D6D6C2]/60 last:border-r-0 transition-colors cursor-pointer group ${
                isToday ? 'bg-[#C0D5C3]/40' : 'hover:bg-[#E4E4D4]/40'
              }`}
            >
              <div className="text-[11px] font-medium text-[#2F3E4A]/70 uppercase tracking-wider leading-none mb-1">
                {weekday}
              </div>
              <div className="inline-flex items-center justify-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-heading ${
                    isToday
                      ? 'bg-[#8C966D] text-white shadow-xs'
                      : 'text-[#2F3E4A] group-hover:text-[#8C966D]'
                  }`}
                >
                  {dayNum}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Calendar Body: Scrollable Time Grid */}
      <div className="relative flex-1 overflow-y-auto max-h-[calc(100vh-230px)] min-h-[500px]">
        {/* Loading Skeleton */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-[#FAF9F0]/85 backdrop-blur-[1px] flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full border-3 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin mb-3" />
            <p className="text-xs font-semibold text-[#2F3E4A]/70">Loading weekly timetable...</p>
          </div>
        )}

        {/* Empty Week Notice (grid still visible underneath) */}
        {!loading && totalLecturesCount === 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div className="bg-[#FAF9F0]/95 border border-[#D6D6C2] rounded-2xl px-6 py-4 shadow-sm text-center">
              <p className="text-xs font-bold text-[#2F3E4A]">No lectures scheduled this week</p>
              <p className="text-[11px] text-[#2F3E4A]/60 mt-0.5">
                Use the navigation arrows or mini calendar to jump to other weeks
              </p>
            </div>
          </div>
        )}

        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `56px repeat(${numCols}, minmax(0, 1fr))`,
            height: `${hourSlots.length * HOUR_HEIGHT}px`,
          }}
        >
          {/* Time Gutter Column */}
          <div className="border-r border-[#D6D6C2]/60 select-none">
            {hourSlots.map((hour) => {
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              const period = hour >= 12 ? 'PM' : 'AM';
              return (
                <div
                  key={hour}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative text-[10px] font-mono text-[#2F3E4A]/55 pr-2 pt-1 text-right border-b border-[#D6D6C2]/40"
                >
                  <span>{displayHour} {period}</span>
                </div>
              );
            })}
          </div>

          {/* Day Columns */}
          {days.map((day) => {
            const dayKey = getLocalDateKey(day);
            const isToday = dayKey === todayKey;
            const dayLectures = lecturesByDay[dayKey] || [];
            const positionedLectures = layoutDayLectures(dayLectures);

            return (
              <div
                key={dayKey}
                className={`relative border-r border-[#D6D6C2]/60 last:border-r-0 ${
                  isToday ? 'bg-[#C0D5C3]/10' : ''
                }`}
              >
                {/* Horizontal Hour Lines */}
                {hourSlots.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-[#D6D6C2]/40"
                  />
                ))}

                {/* "Now" Indicator Line on Today's Column */}
                {isToday && nowIndicator && nowIndicator.dayKey === dayKey && (
                  <div
                    style={{ top: `${nowIndicator.top}px` }}
                    className="absolute inset-x-0 z-20 flex items-center pointer-events-none"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C48E5A] -ml-1.5 shadow-xs" />
                    <div className="h-[2px] flex-1 bg-[#C48E5A]" />
                  </div>
                )}

                {/* Lecture Blocks */}
                {positionedLectures.map((lec) => {
                  const sMin = parseTimeMinutes(lec.startTime);
                  const eMin = parseTimeMinutes(lec.endTime);
                  const durMin = eMin - sMin;

                  const top = ((sMin - startHour * 60) / 60) * HOUR_HEIGHT;
                  const height = (durMin / 60) * HOUR_HEIGHT;

                  const lecDate = new Date(lec.date);
                  const isPast = lecDate < new Date();
                  const isSelected = selectedLectureId === lec._id;

                  return (
                    <LectureBlock
                      key={lec._id}
                      lecture={lec}
                      top={top}
                      height={height}
                      colIndex={lec.colIndex}
                      totalCols={lec.totalCols}
                      isSelected={isSelected}
                      isPast={isPast}
                      onClick={() => onSelectLecture(lec._id)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
