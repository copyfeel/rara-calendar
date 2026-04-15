import { useEventStore } from '../../store/eventStore';
import { getMonthCalendarDays, getTodayDate, getRelativeDateString, solarToLunar } from '../../utils/dateHelper';
import './Calendar.css';

interface CalendarProps {
  currentMonth: Date;
}

const Calendar: React.FC<CalendarProps> = ({ currentMonth }) => {
  const { events, selectedDate, setSelectedDate } = useEventStore();

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

  return (
    <div className="p-4 bg-white">
      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
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
                min-h-32 p-2 border border-pastel-200 cursor-pointer transition
                ${!isCurrentMonth ? 'bg-pastel-50 text-pastel-300' : ''}
                ${isSelected ? 'bg-pastel-200' : 'bg-white'}
                ${dayEvents.length > 0 && !isSelected ? 'bg-pastel-100' : ''}
                ${isToday ? 'border-2 border-pastel-accent' : ''}
                hover:bg-pastel-100
              `}
            >
              {/* 날짜 및 오늘 표시 */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`font-bold text-sm ${
                    idx % 7 === 0 && day ? 'text-red-500' : 'text-pastel-700'
                  }`}
                >
                  {day}
                </span>
                {isToday && (
                  <span className="text-xs text-pastel-orange font-semibold">오늘</span>
                )}
              </div>

              {/* 음력 표시 */}
              {lunarDate && (
                <div className="text-xs text-pastel-400 mb-1">{lunarDate}</div>
              )}

              {/* 일정 미리보기 */}
              <div className="text-xs space-y-1">
                {dayEvents.slice(0, 1).map((event, idx) => (
                  <div
                    key={idx}
                    className="bg-pastel-200 text-pastel-700 px-1 py-0.5 rounded truncate"
                  >
                    {event.title.substring(0, 5)}
                  </div>
                ))}
                {dayEvents.length > 1 && (
                  <div className="text-pastel-500 font-semibold">
                    +{dayEvents.length - 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 오늘 기준 표시일 */}
      {selectedDate && selectedDate !== today && (
        <div className="border-t border-pastel-200 pt-3 text-center">
          <span className="text-sm text-pastel-600">
            {getRelativeDateString(selectedDate)}
          </span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
