import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useEventStore } from '../../store/eventStore';
import {
  getMonthCalendarDays,
  getTodayDate,
  solarToLunar,
  getLunarDisplayDays,
} from '../../utils/dateHelper';
import './Calendar.css';

// 카테고리별 배경색 반환
const getCategoryBgColor = (category: string | null | undefined): string => {
  if (!category) return '';
  switch (category) {
    case 'Work':
      return 'bg-blue-100';
    case 'Personal':
      return 'bg-rose-100';
    case 'Event':
      return 'bg-orange-100';
    case 'Other':
      return 'bg-gray-100';
    default:
      return '';
  }
};

interface CalendarProps {
  currentMonth: Date;
  onMonthChange?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ currentMonth, onMonthChange }) => {
  const { events, selectedDate, setSelectedDate } = useEventStore();
  const [touchStartX, setTouchStartX] = useState<number>(0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const calendarDays = getMonthCalendarDays(year, month);
  const today = getTodayDate();

  // 이 달에 음력을 표시할 날짜 집합 (4일, 주당 1일)
  const lunarDisplayDays = getLunarDisplayDays(year, month);

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!onMonthChange) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const newDate = new Date(currentMonth);
      if (diff > 0) {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      onMonthChange(newDate);
    }
  };

  return (
    <div className="bg-white" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day, idx) => {
          const dateStr = day
            ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null;
          const dayEvents = day ? getEventsForDate(day) : [];
          const isTodayCell = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isCurrentMonth = day !== null;

          // ✅ 실제 요일로 일요일 판단 (idx % 7 방식 제거)
          const isSunday = dateStr ? dayjs(dateStr).day() === 0 : false;

          // 음력은 이 달 중 4일(주당 1일)만 표시
          const showLunar = day !== null && lunarDisplayDays.has(day);
          const lunarDate = showLunar ? solarToLunar(year, month, day!) : '';

          // 카테고리 배경색 (첫 번째 이벤트 기준)
          const firstEventCategory = dayEvents.length > 0 ? dayEvents[0].category : null;
          const categoryBgColor = getCategoryBgColor(firstEventCategory);

          return (
            <div
              key={`${idx}-${day}`}
              onClick={() => handleDateClick(day)}
              className={`
                min-h-16 p-0 cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-pastel-50' : ''}
                ${isSelected ? 'bg-pastel-400' : ''}
                ${dayEvents.length > 0 && !isSelected && isCurrentMonth ? categoryBgColor || 'bg-pastel-100' : ''}
                ${isTodayCell ? 'border border-pastel-accent' : ''}
                hover:bg-pastel-100
              `}
            >
              {/* 칸 내부 */}
              <div className="p-1 h-full flex flex-col">
                {/* 날짜 + 음력 (한 줄) */}
                <div className="flex items-baseline gap-0.5 mb-0.5">
                  {/* ✅ 날짜 크기 50% 키움: text-xs → text-sm */}
                  <span
                    className={`font-bold text-sm leading-none ${
                      isSelected
                        ? 'text-white'
                        : isSunday && isCurrentMonth
                        ? 'text-red-500'
                        : isCurrentMonth
                        ? 'text-pastel-700'
                        : 'text-pastel-300'
                    }`}
                  >
                    {day}
                  </span>
                  {/* ✅ 음력 크기 30% 줄임: text-xs(12px) → 8px, 진한 그레이 */}
                  {lunarDate && (
                    <span
                      className="font-normal text-pastel-600 leading-none"
                      style={{ fontSize: '8px' }}
                    >
                      {lunarDate}
                    </span>
                  )}
                  {isTodayCell && (
                    <span className="text-pastel-orange font-semibold leading-none" style={{ fontSize: '8px' }}>
                      오늘
                    </span>
                  )}
                </div>

                {/* 일정 미리보기 */}
                {isCurrentMonth && (
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 1).map((event, i) => (
                      <div
                        key={i}
                        className="bg-pastel-200 text-pastel-700 px-0.5 rounded truncate"
                        style={{ fontSize: '9px' }}
                      >
                        {event.title.substring(0, 5)}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-pastel-500 font-semibold" style={{ fontSize: '9px' }}>
                        +{dayEvents.length - 1}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
