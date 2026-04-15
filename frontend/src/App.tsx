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
        <Calendar currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        <EventDisplay
          onOpenEventEditor={(event) => {
            setEditingEvent(event);
            setShowEventEditor(true);
          }}
          onOpenTodoList={() => setShowTodoList(true)}
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
    </div>
  );
}

export default App;
