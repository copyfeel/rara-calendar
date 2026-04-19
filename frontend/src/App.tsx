import { useEffect, useState, useRef, useCallback } from 'react';
import { useEventStore } from './store/eventStore';
import { useAuthStore } from './store/authStore';
import { useNotification } from './hooks/useNotification';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header/Header';
import EventEditor from './components/EventEditor/EventEditor';
import EventDisplay from './components/EventDisplay/EventDisplay';
import SearchScreen from './components/SearchScreen/SearchScreen';
import TodoList from './components/TodoList/TodoList';
import AdminPanel from './components/AdminPanel/AdminPanel';
import LoginScreen from './components/Auth/LoginScreen';
import type { Event } from './types/event';
import './App.css';

function App() {
  const { loadFromStorage, saveToStorage, initializeFirestoreSync, clearFirestoreSync } =
    useEventStore();
  const { user, loading, initialized } = useAuthStore();
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isPC, setIsPC] = useState(window.innerWidth >= 768);

  // 캘린더 하단 위치 계산 (투두 리스트 최대 높이 결정)
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarBottom, setCalendarBottom] = useState<number>(0);

  // 월 변경 시 선택된 날짜의 '일'을 유지
  const handleMonthChange = useCallback((newMonth: Date) => {
    setCurrentMonth(newMonth);

    // PC 버전에서 선택된 날짜의 '일'을 새 달에서도 유지
    const { selectedDate, setSelectedDate } = useEventStore.getState();
    if (selectedDate) {
      const selectedDay = parseInt(selectedDate.split('-')[2]);
      const lastDayOfMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0).getDate();
      const dayToSet = Math.min(selectedDay, lastDayOfMonth);

      const newDateStr = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, '0')}-${String(dayToSet).padStart(2, '0')}`;
      setSelectedDate(newDateStr);
    }
  }, []);

  // 검색/투두에서 날짜 선택 시 월 변경
  const handleDateSelect = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const updateCalendarBottom = useCallback(() => {
    if (calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      setCalendarBottom(rect.bottom);
    }
  }, []);

  useEffect(() => {
    // 초기 측정
    updateCalendarBottom();

    // 리사이즈 및 방향 전환 시 재측정
    const handleResize = () => {
      updateCalendarBottom();
      setIsPC(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateCalendarBottom, currentMonth]);

  // 알람 기능 활성화
  useNotification();

  // 모달 활성화 시 메인화면 scroll 고정 (TodoList, SearchScreen, EventEditor, AdminPanel)
  useEffect(() => {
    if (showTodoList || showSearchScreen || showEventEditor || showAdminPanel) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showTodoList, showSearchScreen, showEventEditor, showAdminPanel]);

  // Firebase 동기화 관리
  useEffect(() => {
    if (!initialized) return;

    if (user) {
      // 사용자 로그인 → Firestore 동기화 시작
      initializeFirestoreSync(user.uid);
    } else {
      // 사용자 로그아웃 → localStorage로 돌아가기
      clearFirestoreSync();
      loadFromStorage();
    }
  }, [user, initialized, initializeFirestoreSync, clearFirestoreSync, loadFromStorage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    const autoSaveInterval = setInterval(() => {
      saveToStorage();
    }, 30000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(autoSaveInterval);
    };
  }, [saveToStorage]);

  // 인증 시스템 초기화 중
  if (!initialized || loading) {
    return (
      <div className="w-full min-h-screen bg-pastel-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗓️</div>
          <p className="text-pastel-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 미로그인 상태
  if (!user) {
    return <LoginScreen />;
  }

  // 로그인 상태 - 메인 앱
  return (
    <div className="bg-pastel-100 flex justify-center w-screen h-screen overflow-hidden" style={{ touchAction: 'none' }}>
      <div
        className="bg-pastel-50 flex flex-col shadow-lg overflow-hidden"
        style={{
          width: isPC ? '30%' : '100%',
          touchAction: 'auto',
        }}
      >
        <Header
          onOpenSearch={() => {
            setShowTodoList(false);
            setShowSearchScreen(true);
          }}
          onOpenAdmin={() => {
            setShowTodoList(false);
            setShowAdminPanel(true);
          }}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* calendarRef로 캘린더 하단 위치 측정 */}
          <div ref={calendarRef}>
            <Calendar currentMonth={currentMonth} onMonthChange={handleMonthChange} />
          </div>
          <EventDisplay
            onOpenEventEditor={(event) => {
              setShowTodoList(false);
              setEditingEvent(event);
              setShowEventEditor(true);
            }}
            onOpenTodoList={() => setShowTodoList(true)}
            onMonthChange={handleMonthChange}
            isPC={isPC}
          />
        </main>
      </div>

      {/* 모달들 - 전체 화면 사용 */}
      {showEventEditor && (
        <EventEditor
          editingEvent={editingEvent}
          onClose={() => {
            setShowEventEditor(false);
            setEditingEvent(undefined);
          }}
        />
      )}

      {showSearchScreen && (
        <SearchScreen
          onClose={() => setShowSearchScreen(false)}
          onDateSelect={handleDateSelect}
        />
      )}

      {/* 투두 리스트 - calendarBottom 전달 */}
      {showTodoList && (
        <TodoList
          onClose={() => setShowTodoList(false)}
          calendarBottom={calendarBottom}
          onDateSelect={handleDateSelect}
          isPC={isPC}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default App;
