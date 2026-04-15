import { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getNextDaysEvents } from '../../utils/dateHelper';

const TodoList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { events } = useEventStore();
  const [completedEvents, setCompletedEvents] = useState<Set<string>>(new Set());

  const upcomingEvents = getNextDaysEvents(events, 10);

  const handleToggleComplete = (eventId: string) => {
    const newCompleted = new Set(completedEvents);
    if (newCompleted.has(eventId)) {
      newCompleted.delete(eventId);
    } else {
      newCompleted.add(eventId);
    }
    setCompletedEvents(newCompleted);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-pastel-200 rounded-t-2xl shadow-2xl animate-slideUp max-h-[70vh] overflow-hidden flex flex-col"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-pastel-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-pastel-700">오늘부터 10일 일정</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-pastel-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 일정 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {upcomingEvents.length === 0 ? (
          <div className="p-8 text-center text-pastel-400">
            <p>예정된 일정이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-pastel-200">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="p-4 hover:bg-pastel-50 transition flex items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={completedEvents.has(event.id)}
                  onChange={() => handleToggleComplete(event.id)}
                  className="rounded cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${
                      completedEvents.has(event.id)
                        ? 'line-through text-pastel-400'
                        : 'text-pastel-700'
                    }`}
                  >
                    {event.title}
                  </div>
                  <div className="text-xs text-pastel-500">
                    {event.date} {event.startTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
