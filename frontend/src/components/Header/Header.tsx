import { useEventStore } from '../../store/eventStore';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin, currentMonth, onMonthChange }) => {
  useEventStore();

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <header className="bg-white border-b border-pastel-200 sticky top-0 z-50 shadow-sm">
      {/* 상단 메뉴바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-pastel-200">
        {/* 검색 아이콘 */}
        <button
          onClick={onOpenSearch}
          className="p-2 hover:bg-pastel-100 rounded-lg transition"
          title="검색"
        >
          <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* 연/월 표시 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-pastel-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-lg font-semibold text-pastel-700 min-w-[100px] text-center">
            {year}년 {month}월
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-pastel-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 관리자 아이콘 */}
        <button
          onClick={onOpenAdmin}
          className="p-2 hover:bg-pastel-100 rounded-lg transition"
          title="설정"
        >
          <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.26 2.632 1.732-.203.531.229 1.121.769 1.121a1.7 1.7 0 001.45 2.456c1.356.426 1.356 2.278 0 2.704a1.7 1.7 0 00-1.45 2.456c.546 1.13-.88 2.368-1.92 1.91-.552-.326-1.357.063-1.357.723v1.737c0 .74-.644 1.337-1.435 1.337H6.435c-.79 0-1.435-.597-1.435-1.337V18.3c0-.66-.805-1.049-1.357-.723-.486.286-1.64-.096-1.92-.911-.545-1.13.134-2.408 1.45-2.456a1.7 1.7 0 001.45-2.456c-.666-1.195.236-2.347.92-1.910.552.326 1.357-.063 1.357-.723v-.737a1.7 1.7 0 00-.95-1.522c-1.356-.426-1.356-2.278 0-2.704a1.7 1.7 0 00.95-1.522V5.04c0-.66.805-1.049 1.357-.723.552.326 1.357-.063 1.357-.723a1.724 1.724 0 001.066-2.573z" />
          </svg>
        </button>
      </div>

      {/* 요일 표시 */}
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center font-semibold ${
              idx === 0 ? 'text-red-500' : 'text-pastel-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px bg-pastel-200"></div>
    </header>
  );
};

export default Header;
