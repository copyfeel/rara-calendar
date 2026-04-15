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

        {/* 연/월 표시 - PC에서만 버튼 표시 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-pastel-100 rounded-lg transition hidden sm:block"
            title="이전 달"
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
            className="p-2 hover:bg-pastel-100 rounded-lg transition hidden sm:block"
            title="다음 달"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 관리자 아이콘 - 심플한 스타일로 변경 */}
        <button
          onClick={onOpenAdmin}
          className="p-2 hover:bg-pastel-100 rounded-lg transition"
          title="설정"
        >
          <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* 요일 표시 - 높이와 글자 크기 70% */}
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`py-1.5 text-center font-semibold text-sm ${
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
