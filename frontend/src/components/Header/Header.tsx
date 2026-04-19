import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin, currentMonth, onMonthChange }) => {
  useEventStore();
  const { signOut } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  };

  // 모바일 환경에서 헤더 위치를 원위치로 복구
  useEffect(() => {
    const handleRestoreHeaderPosition = () => {
      if (headerRef.current) {
        // 헤더를 항상 상단에 유지
        headerRef.current.scrollIntoView({ block: 'start' });
      }
    };

    // 윈도우 리사이즈, 방향 전환, 스크롤 시 헤더 위치 복구
    window.addEventListener('resize', handleRestoreHeaderPosition);
    window.addEventListener('orientationchange', handleRestoreHeaderPosition);
    window.addEventListener('scroll', handleRestoreHeaderPosition, true);

    return () => {
      window.removeEventListener('resize', handleRestoreHeaderPosition);
      window.removeEventListener('orientationchange', handleRestoreHeaderPosition);
      window.removeEventListener('scroll', handleRestoreHeaderPosition, true);
    };
  }, []);

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
    <header ref={headerRef} className="bg-white border-b border-pastel-200 sticky top-0 z-50 shadow-sm">
      {/* 상단 메뉴바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-pastel-200">
        {/* 검색 아이콘 (좌측) */}
        <button
          onClick={onOpenSearch}
          className="p-2 hover:bg-pastel-100 rounded-lg transition"
          title="검색"
        >
          <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* 연/월 표시 (중앙) */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-pastel-100 rounded-lg transition hidden sm:block"
            title="이전 달"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-lg font-semibold text-pastel-700 min-w-[120px] text-center">
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

        {/* 관리자 + 로그아웃 버튼 (우측 나란히) */}
        <div className="flex items-center gap-2">
          {/* 관리자 아이콘 */}
          <button
            onClick={onOpenAdmin}
            className="p-2 hover:bg-pastel-100 rounded-lg transition"
            title="설정"
          >
            <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-2 hover:bg-pastel-100 rounded-lg transition disabled:opacity-50"
            title="로그아웃"
          >
            <svg className="w-6 h-6 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* 요일 표시 - 높이와 글자 크기 40% 축소 */}
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`py-0.5 text-center font-semibold text-xs ${
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
