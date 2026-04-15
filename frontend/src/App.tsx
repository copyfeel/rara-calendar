import { useEffect, useState } from 'react';
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

  // 알람 기능 활성화
  useNotification();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 자동 저장 (30초마다)
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
        onOpenSearch={() => setShowSearchScreen(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />
      <main className="flex-1 overflow-auto flex flex-col">
        <Calendar currentMonth={currentMonth} />
        <EventDisplay
          onOpenEventEditor={(event) => {
            setEditingEvent(event);
            setShowEventEditor(true);
          }}
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

      {showTodoList && (
        <TodoList onClose={() => setShowTodoList(false)} />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Todo List 트리거 버튼 (우측 하단) */}
      <button
        onClick={() => setShowTodoList(!showTodoList)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-pastel-400 text-white rounded-full shadow-lg hover:bg-pastel-500 transition flex items-center justify-center"
        title="투두 리스트"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </button>
    </div>
  );
}

export default App;
