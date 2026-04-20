import React, { useState, useRef } from 'react';
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
    case '업무':
      return 'bg-green-100';
    case '카피':
      return 'bg-indigo-200';
    case 'Event':
      return 'bg-orange-100';
    case '가족':
      return 'bg-stone-200';
    case '예주':
      return 'bg-pink-300';
    case '마님':
      return 'bg-red-100';
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
  const [dragX, setDragX] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = getTodayDate();

  // 이전/다음 달 계산
  const getPrevMonth = (date: Date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    return d;
  };

  const getNextMonth = (date: Date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  };

  const prevMonth = getPrevMonth(currentMonth);
  const nextMonth = getNextMonth(currentMonth);

  // 단일 달의 캘린더 렌더링 헬퍼
  const renderMonthGrid = (month: Date) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    const calendarDays = getMonthCalendarDays(year, monthNum);
    const lunarDisplayDays = getLunarDisplayDays(year, monthNum);

    const getEventsForDate = (day: number | null) => {
      if (!day) return [];
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return events.filter(event => event.date === dateStr);
    };

    return (
      <div className="w-full flex-shrink-0">
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day, idx) => {
            const dateStr = day
              ? `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : null;
            const dayEvents = day ? getEventsForDate(day) : [];
            const isTodayCell = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isCurrentMonth = day !== null;
            const isSunday = dateStr ? dayjs(dateStr).day() === 0 : false;
            const showLunar = day !== null && lunarDisplayDays.has(day);
            const lunarDate = showLunar ? solarToLunar(year, monthNum, day!) : '';

            const getCellBgClass = (): string => {
              if (isSelected) return 'bg-pastel-400';
              if (!isCurrentMonth) return 'bg-pastel-50';
              if (dayEvents.length > 0) return 'bg-gray-100'; // 연한 그레이색
              return '';
            };

            return (
              <div
                key={`${idx}-${day}`}
                onClick={() => day && setSelectedDate(dateStr || '')}
                className={[
                  'min-h-16 p-0 cursor-pointer transition-colors rounded-md',
                  getCellBgClass(),
                  isSelected ? '' : 'hover:bg-pastel-100',
                  isTodayCell ? 'border border-pastel-accent' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="p-1 h-full flex flex-col">
                  <div className="flex items-baseline gap-0.5 mb-0.5">
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
                  {isCurrentMonth && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 1).map((event, i) => (
                        <div
                          key={i}
                          className={`${getCategoryBgColor(event.category) || 'bg-pastel-200'} text-pastel-700 px-0.5 rounded truncate`}
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX;
    setDragX(dx);
  };

  const handleTouchEnd = () => {
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const swipePercentage = Math.abs(dragX) / containerWidth * 100;
    const threshold = 25; // 25% 임계값

    // 스냅 애니메이션 시작
    setIsSnapping(true);

    if (swipePercentage > threshold && onMonthChange) {
      // 선택된 날짜의 '일' 부분 추출
      const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

      const newDate = new Date(currentMonth);
      if (dragX < 0) {
        // 왼쪽으로 스와이프 → 다음 달
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        // 오른쪽으로 스와이프 → 이전 달
        newDate.setMonth(newDate.getMonth() - 1);
      }

      // 선택된 '일'을 새 달에서 유지 (말일 처리)
      if (selectedDay) {
        const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        const dayToSet = Math.min(selectedDay, lastDayOfMonth);
        newDate.setDate(dayToSet);

        const newDateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(dayToSet).padStart(2, '0')}`;
        setSelectedDate(newDateStr);
      }

      onMonthChange(newDate);
    }

    // 부드러운 스냅 애니메이션으로 원위치 또는 다음 달로 이동
    setDragX(0);

    // 애니메이션 완료 후 스냅 상태 해제
    setTimeout(() => setIsSnapping(false), 300);
  };

  // 캐로셀 컨테이너 transform 계산
  const carouselTransform = `translateX(calc(-100% + ${dragX}px))`;
  // 스냅 중이거나 dragX가 0일 때 부드러운 전환
  const shouldTransition = isSnapping || dragX === 0;

  return (
    <div
      ref={containerRef}
      className="bg-white overflow-hidden relative z-20"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 캐로셀: 이전월 | 현재월 | 다음월 */}
      <div
        style={{
          display: 'flex',
          transform: carouselTransform,
          transition: shouldTransition ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        {renderMonthGrid(prevMonth)}
        {renderMonthGrid(currentMonth)}
        {renderMonthGrid(nextMonth)}
      </div>
    </div>
  );
};

export default Calendar;
