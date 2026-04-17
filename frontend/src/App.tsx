import { useEffect, useState, useRef, useCallback } from 'react';
import { useEventStore } from './store/eventStore';
import { useNotification } from './hooks/useNotification';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header/Header';
import EventEditor from './components/EventEditor/EventEditor';
import EventDisplay from './components/EventDisplay/EventDisplay';
import SearchScreen from './components/SearchScreen/SearchScreen';
import TodoList from './components/TodoList/TodoList';
import AdminPanel from './components/AdminPanel/AdminPanel';
import type { Event } from './types/event';
import './App.css';

function App() {
  const { loadFromStorage, saveToStorage } = useEventStore();
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 캘린더 하단 위치 계산 (투두 리스트 최대 높이 결정)
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarBottom, setCalendarBottom] = useState<number>(0);

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
    window.addEventListener('resize', updateCalendarBottom);
    window.addEventListener('orientationchange', updateCalendarBottom);

    return () => {
      window.removeEventListener('resize', updateCalendarBottom);
      window.removeEventListener('orientationchange', updateCalendarBottom);
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

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

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

  return (
    <div className="w-full min-h-screen bg-pastel-50 flex flex-col">
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
        onMonthChange={setCurrentMonth}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* calendarRef로 캘린더 하단 위치 측정 */}
        <div ref={calendarRef}>
          <Calendar currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
        <EventDisplay
          onOpenEventEditor={(event) => {
            setShowTodoList(false);
            setEditingEvent(event);
            setShowEventEditor(true);
          }}
          onOpenTodoList={() => setShowTodoList(true)}
          onMonthChange={setCurrentMonth}
        />
      </main>

      {/* 모달들 */}
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
        <SearchScreen onClose={() => setShowSearchScreen(false)} />
      )}

      {/* 투두 리스트 - calendarBottom 전달 */}
      {showTodoList && (
        <TodoList
          onClose={() => setShowTodoList(false)}
          calendarBottom={calendarBottom}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default App;
