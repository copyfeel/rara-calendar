import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(isBetween);

export const getMonthDays = (year: number, month: number) => {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).day();
};

export const getMonthCalendarDays = (year: number, month: number) => {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getMonthDays(year, month);

  const calendar: (number | null)[] = [];

  // ✅ 버그 수정: firstDay - 1 → firstDay
  // 예) 4월 1일이 수요일(index=3)이면 앞에 null 3개 (SUN, MON, TUE)
  for (let i = firstDay; i > 0; i--) {
    calendar.unshift(null);
  }

  // 현재 달의 날들
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push(i);
  }

  // 다음 달의 첫 날들
  while (calendar.length % 7 !== 0) {
    calendar.push(null);
  }

  return calendar;
};

export const formatDate = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatTime = (time: string): string => {
  return dayjs(time, 'HH:mm').format('HH:mm');
};

export const getDateDifference = (date1: string, date2: string): number => {
  return dayjs(date2).diff(dayjs(date1), 'day');
};

export const getRelativeDateString = (date: string): string => {
  const today = dayjs().format('YYYY-MM-DD');
  const diff = getDateDifference(today, date);

  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  if (diff > 0) return `${diff}일 후`;
  if (diff < 0) return `${Math.abs(diff)}일 전`;
  return '';
};

export const getTodayDate = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getNextDaysEvents = (events: any[], days: number = 10) => {
  const today = getTodayDate();
  const futureDate = dayjs(today).add(days, 'day').format('YYYY-MM-DD');

  return events.filter(event => {
    const eventDate = dayjs(event.date);
    const todayDayjs = dayjs(today);
    const futureDateDayjs = dayjs(futureDate);

    return eventDate.isBetween(todayDayjs, futureDateDayjs, null, '[]');
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 음력 변환 함수
const lunarCalendar = require('lunar-calendar');

export const solarToLunar = (year: number, month: number, day: number): string => {
  try {
    const lunarData = lunarCalendar.solarToLunar(year, month, day);
    if (lunarData && lunarData.lunarMonth && lunarData.lunarDay) {
      // '음월.일' 형식: 예) 음2.28
      return `음${lunarData.lunarMonth}.${lunarData.lunarDay}`;
    }
  } catch (error) {
    console.error('Error converting to lunar date:', error);
  }
  return '';
};

// 결정론적 해시 함수 (year/month 기반으로 항상 동일한 날 선택)
const deterministicHash = (seed: number): number => {
  let h = seed;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return Math.abs(h ^ (h >>> 16));
};

// 한 달에 4일만 음력 표시 (일주일에 한 번씩, year/month 기반 결정론적 선택)
export const getLunarDisplayDays = (year: number, month: number): Set<number> => {
  const calendarDays = getMonthCalendarDays(year, month);
  const weeks: number[][] = [];

  // 7일씩 묶어서 각 주의 실제 날짜 배열 구성
  for (let i = 0; i < calendarDays.length; i += 7) {
    const week = calendarDays.slice(i, i + 7).filter((d): d is number => d !== null);
    if (week.length > 0) {
      weeks.push(week);
    }
  }

  const selectedDays = new Set<number>();

  // 최대 4주에서 각 1개씩 선택 (일주일에 한 번 조건 만족)
  const weeksToUse = weeks.slice(0, 4);
  weeksToUse.forEach((week, weekIdx) => {
    const seed = deterministicHash(year * 1200 + month * 100 + weekIdx * 7);
    selectedDays.add(week[seed % week.length]);
  });

  return selectedDays;
};

export const isToday = (date: string): boolean => {
  return date === getTodayDate();
};

export const isSameMonth = (date: string, year: number, month: number): boolean => {
  const dateObj = dayjs(date);
  return dateObj.year() === year && dateObj.month() === month - 1;
};

// 날짜 문자열의 요일이 일요일인지 확인
export const isSundayDate = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return dayjs(dateStr).day() === 0;
};

// 날짜 문자열로부터 한글 요일 반환
export const getKoreanDayOfWeek = (dateStr: string): string => {
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];
  const dayIndex = dayjs(dateStr).day();
  return koreanDays[dayIndex];
};
