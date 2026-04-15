import React, { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getMonthCalendarDays, getTodayDate, solarToLunar } from '../../utils/dateHelper';
import './Calendar.css';

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
    const threshold = 50; // 50px 이상 드래그 시 변경

    if (Math.abs(diff) > threshold) {
      const newDate = new Date(currentMonth);
      if (diff > 0) {
        // 오른쪽에서 왼쪽 드래그 = 다음 달
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        // 왼쪽에서 오른쪽 드래그 = 이전 달
        newDate.setMonth(newDate.getMonth() - 1);
      }
      onMonthChange(newDate);
    }
  };

  return (
    <div className="bg-white" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* 캘린더 그리드 - border 완전 제거 */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day, idx) => {
          const dateStr = day
            ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null;
          const dayEvents = day ? getEventsForDate(day) : [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isCurrentMonth = day !== null;

          const lunarDate = day ? solarToLunar(year, month, day) : '';

          return (
            <div
              key={`${idx}-${day}`}
              onClick={() => handleDateClick(day)}
              className={`
                min-h-16 p-0 cursor-pointer transition
                ${!isCurrentMonth ? 'bg-pastel-50 text-pastel-300' : ''}
                ${isSelected ? 'bg-pastel-200' : 'bg-white'}
                ${dayEvents.length > 0 && !isSelected ? 'bg-pastel-100' : ''}
                ${isToday ? 'border-4 border-pastel-accent' : 'border border-pastel-200'}
                hover:bg-pastel-100
              `}
            >
              {/* 캘린더 칸 내부 내용 */}
              <div className="p-1 h-full flex flex-col">
                {/* 날짜 및 오늘 표시, 음력 날짜 */}
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className={`font-bold text-xs ${
                        idx % 7 === 0 && day ? 'text-red-500' : 'text-pastel-700'
                      }`}
                    >
                      {day}
                    </span>
                    {/* 음력 날짜 - 양력 우측, 50% 크기, 연한 그레이 */}
                    {lunarDate && (
                      <span className="text-xs text-pastel-300 font-light">
                        {lunarDate}
                      </span>
                    )}
                  </div>
                  {isToday && (
                    <span className="text-xs text-pastel-orange font-semibold">오늘</span>
                  )}
                </div>

                {/* 일정 미리보기 */}
                <div className="text-xs space-y-0.5">
                  {dayEvents.slice(0, 1).map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-pastel-200 text-pastel-700 px-0.5 py-0.5 rounded truncate text-xs"
                    >
                      {event.title.substring(0, 5)}
                    </div>
                  ))}
                  {dayEvents.length > 1 && (
                    <div className="text-pastel-500 font-semibold text-xs">
                      +{dayEvents.length - 1}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 오늘 기준 표시일 - EventDisplay로 이동되었으므로 여기서는 삭제 */}
    </div>
  );
};

export default Calendar;
