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

  // 이전 달의 마지막 날들
  for (let i = firstDay - 1; i > 0; i--) {
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
import { Lunar } from 'lunar-calendar';

export const solarToLunar = (year: number, month: number, day: number): string => {
  try {
    const lunar = Lunar.fromSolar(year, month, day);
    if (lunar) {
      return `음${lunar.lunarDay}`;
    }
  } catch (error) {
    console.error('Error converting to lunar date:', error);
  }
  return '';
};

export const isToday = (date: string): boolean => {
  return date === getTodayDate();
};

export const isSameMonth = (date: string, year: number, month: number): boolean => {
  const dateObj = dayjs(date);
  return dateObj.year() === year && dateObj.month() === month - 1;
};
