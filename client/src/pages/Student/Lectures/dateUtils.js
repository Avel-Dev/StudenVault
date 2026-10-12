// Utility functions for safe local date manipulation and calendar layout

export function getLocalDateKey(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(str) {
  if (!str) return new Date();
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

export function getMondayOfWeek(d) {
  const date = d instanceof Date ? new Date(d) : parseDateKey(d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeekDays(mondayDate, includeSunday = false) {
  const count = includeSunday ? 7 : 6;
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatWeekRangeLabel(days) {
  if (!days || days.length === 0) return '';
  const start = days[0];
  const end = days[days.length - 1];
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
}

export function parseTimeMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  const min = String(m || 0).padStart(2, '0');
  return `${hour}:${min} ${period}`;
}

// Layout overlapping lectures for a day column
export function layoutDayLectures(lectures) {
  if (!lectures || lectures.length === 0) return [];
  
  // Sort by start time, then duration descending
  const sorted = [...lectures].sort((a, b) => {
    const aStart = parseTimeMinutes(a.startTime);
    const bStart = parseTimeMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aDur = parseTimeMinutes(a.endTime) - aStart;
    const bDur = parseTimeMinutes(b.endTime) - bStart;
    return bDur - aDur;
  });

  // Group into clusters of overlapping lectures
  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  sorted.forEach((item) => {
    const start = parseTimeMinutes(item.startTime);
    const end = parseTimeMinutes(item.endTime);
    if (currentCluster.length === 0 || start < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = end;
    }
  });

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result = [];
  clusters.forEach((cluster) => {
    // Greedy column allocation
    const cols = [];
    cluster.forEach((item) => {
      const itemStart = parseTimeMinutes(item.startTime);
      let colIdx = 0;
      while (cols[colIdx] && parseTimeMinutes(cols[colIdx].endTime) > itemStart) {
        colIdx++;
      }
      cols[colIdx] = item;
      item._colIdx = colIdx;
    });

    const totalCols = cols.length;
    cluster.forEach((item) => {
      result.push({
        ...item,
        colIndex: item._colIdx || 0,
        totalCols: totalCols || 1,
      });
    });
  });

  return result;
}

// Palette accent mapping for subject tags
export const SUBJECT_ACCENT_STYLES = [
  {
    bg: 'bg-[#C0D5C3]/40 hover:bg-[#C0D5C3]/60',
    border: 'border-[#A9B28C]/60',
    accentBorder: 'border-l-[#8C966D]',
    badge: 'bg-[#8C966D] text-white',
    textAccent: 'text-[#8C966D]',
  },
  {
    bg: 'bg-[#A9B28C]/25 hover:bg-[#A9B28C]/40',
    border: 'border-[#8C966D]/50',
    accentBorder: 'border-l-[#A9B28C]',
    badge: 'bg-[#A9B28C] text-white',
    textAccent: 'text-[#8C966D]',
  },
  {
    bg: 'bg-[#C48E5A]/15 hover:bg-[#C48E5A]/25',
    border: 'border-[#C48E5A]/40',
    accentBorder: 'border-l-[#C48E5A]',
    badge: 'bg-[#C48E5A] text-white',
    textAccent: 'text-[#C48E5A]',
  },
  {
    bg: 'bg-[#D4A93C]/15 hover:bg-[#D4A93C]/25',
    border: 'border-[#D4A93C]/40',
    accentBorder: 'border-l-[#D4A93C]',
    badge: 'bg-[#D4A93C] text-[#2F3E4A]',
    textAccent: 'text-[#BF942B]',
  },
];

export function getSubjectAccent(subjectCode = '') {
  let hash = 0;
  for (let i = 0; i < subjectCode.length; i++) {
    hash = (hash << 5) - hash + subjectCode.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % SUBJECT_ACCENT_STYLES.length;
  return SUBJECT_ACCENT_STYLES[idx];
}
