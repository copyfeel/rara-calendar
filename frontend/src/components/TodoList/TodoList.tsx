import { useState, useEffect } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getNextDaysEvents } from '../../utils/dateHelper';

interface TodoListProps {
  onClose: () => void;
  calendarBottom?: number; // 캘린더 하단 위치 (px) - 투두 리스트 최대 높이 계산용
}

const TodoList: React.FC<TodoListProps> = ({ onClose, calendarBottom = 0 }) => {
  const { events } = useEventStore();
  const [completedEvents, setCompletedEvents] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  const upcomingEvents = getNextDaysEvents(events, 10);

  // 마운트 후 슬라이드 업 시작
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    // 슬라이드 다운 후 닫기
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleToggleComplete = (eventId: string) => {
    const newCompleted = new Set(completedEvents);
    if (newCompleted.has(eventId)) {
      newCompleted.delete(eventId);
    } else {
      newCompleted.add(eventId);
    }
    setCompletedEvents(newCompleted);
  };

  // 투두 리스트 최대 높이:
  // 전체 화면 높이 - 캘린더 하단 위치 = 입력란+하단메뉴 영역 전체
  const maxHeight = calendarBottom > 0
    ? `${window.innerHeight - calendarBottom}px`
    : '50vh';

  return (
    <>
      {/* 반투명 오버레이 (캘린더 영역 아래만 어둡게) */}
      <div
        className="todo-overlay fixed inset-0 bg-black/20 z-40"
        style={{ top: `${calendarBottom}px` }}
        onClick={handleClose}
      />

      {/* 투두 리스트 패널 */}
      <div
        className="fixed left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          bottom: 0,
          maxHeight,
          // 슬라이드 애니메이션
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* ─── 헤더 (항상 고정) ─── */}
        <div className="flex-shrink-0 bg-white border-b border-pastel-100 px-4 py-3 flex items-center justify-between">
          {/* 상단 핸들 바 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-pastel-300 rounded-full" />
          <h2 className="text-sm font-semibold text-pastel-700 mt-1">오늘부터 10일 일정</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-pastel-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ─── 일정 리스트 (스크롤 가능) ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {upcomingEvents.length === 0 ? (
            <div className="py-10 text-center text-pastel-400 text-sm">
              예정된 일정이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-pastel-100">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="px-4 py-3 hover:bg-pastel-50 transition flex items-center gap-3"
                >
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={completedEvents.has(event.id)}
                    onChange={() => handleToggleComplete(event.id)}
                    className="w-4 h-4 rounded accent-pastel-400 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        completedEvents.has(event.id)
                          ? 'line-through text-pastel-400'
                          : 'text-pastel-700'
                      }`}
                    >
                      {event.title}
                    </div>
                    <div className="text-xs text-pastel-400 mt-0.5">
                      {event.date}
                      {event.startTime ? ` · ${event.startTime}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* iOS 하단 Safe Area 여백 */}
          <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
    </>
  );
};

export default TodoList;
