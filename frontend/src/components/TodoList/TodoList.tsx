import { useState, useEffect, useRef } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getRangedEvents, getKoreanDayOfWeek } from '../../utils/dateHelper';

interface TodoListProps {
  onClose: () => void;
  calendarBottom?: number;
  onDateSelect: (date: string) => void;
  isPC?: boolean;
}

const CLOSE_THRESHOLD = 80;
const STORAGE_KEY = 'todo-completed';

const TodoList: React.FC<TodoListProps> = ({ onClose, calendarBottom = 0, onDateSelect, isPC = false }) => {
  const { events, setSelectedDate } = useEventStore();

  // 체크 상태: Map<eventId, 체크한 타임스탬프>
  const [completedEvents, setCompletedEvents] = useState<Map<string, number>>(new Map());

  // ── 슬라이드 상태 ──
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  // 이전 30일 ~ 이후 30일 일정
  const rangedEvents = getRangedEvents(events, 30, 30);

  // 마운트 시: localStorage에서 체크 상태 로드 + 범위 밖 항목 자동 제거
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const entries: [string, number][] = JSON.parse(saved);
        const rangedIds = new Set(rangedEvents.map(e => e.id));
        // ±30일 범위 안에 있는 이벤트의 체크 상태만 유지
        const valid = new Map(entries.filter(([id]) => rangedIds.has(id)));
        setCompletedEvents(valid);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(valid.entries())));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    requestAnimationFrame(() => setVisible(true));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── 닫기 ──
  const handleClose = () => {
    setDragY(0);
    setVisible(false);
    setTimeout(onClose, 280);
  };

  // 체크 토글: 체크 시 타임스탬프 저장, 해제 시 제거
  const handleToggleComplete = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const next = new Map(completedEvents);
    if (next.has(eventId)) {
      next.delete(eventId);
    } else {
      next.set(eventId, Date.now());
    }
    setCompletedEvents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next.entries())));
  };

  const handleEventClick = (event: typeof events[0]) => {
    setSelectedDate(event.date);
    onDateSelect(event.date);
    handleClose();
  };

  // ── 드래그 다운으로 닫기 ──
  const handleDragStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setDragY(0);
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    setDragY(Math.max(0, delta));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragY >= CLOSE_THRESHOLD) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  // ── 패널 transform / transition ──
  const panelTransform = isDragging
    ? `translateY(${dragY}px)`
    : visible
      ? 'translateY(0)'
      : 'translateY(100%)';

  const panelTransition = isDragging
    ? 'none'
    : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  const maxHeight = calendarBottom > 0
    ? `${window.innerHeight - calendarBottom}px`
    : '50vh';

  // ±30일 범위 내 전체 표시 (체크된 항목은 취소선, 범위 벗어나면 자연히 사라짐)
  const visibleEvents = rangedEvents;

  return (
    <>
      {/* 반투명 오버레이 */}
      <div
        className="todo-overlay fixed inset-0 bg-black/20 z-40"
        onClick={handleClose}
      />

      {/* 투두 리스트 패널 */}
      <div
        className="fixed z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          left: isPC ? 'calc(50% - 15%)' : '0',
          right: isPC ? 'auto' : '0',
          width: isPC ? '30%' : '100%',
          bottom: 0,
          maxHeight,
          transform: panelTransform,
          transition: panelTransition,
        }}
      >
        {/* 헤더 + 드래그 핸들 */}
        <div
          className="sticky top-0 z-10 flex-shrink-0 bg-white border-b border-pastel-100 px-4 py-3 flex items-center justify-between relative select-none"
          style={{ cursor: 'grab', touchAction: 'none' }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-pastel-300 rounded-full" />

          <h2 className="text-sm font-semibold text-pastel-700 mt-1">
            30일 전 ~ 앞으로 30일 일정
          </h2>

          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-pastel-100 rounded-lg transition"
            title="닫기"
          >
            <svg className="w-5 h-5 text-pastel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 일정 리스트 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {visibleEvents.length === 0 ? (
            <div className="py-10 text-center text-pastel-400 text-sm">
              일정이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-pastel-100">
              {visibleEvents.map(event => {
                const isChecked = completedEvents.has(event.id);
                return (
                  <div
                    key={event.id}
                    className="px-4 py-3 hover:bg-pastel-50 transition flex items-center gap-3 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleToggleComplete(e as unknown as React.MouseEvent, event.id)}
                      onClick={(e) => handleToggleComplete(e, event.id)}
                      className="w-4 h-4 rounded accent-pastel-400 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        isChecked ? 'line-through text-pastel-300' : 'text-pastel-700'
                      }`}>
                        {event.title}
                      </div>
                      <div className="text-xs text-pastel-400 mt-0.5">
                        {event.date} {getKoreanDayOfWeek(event.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
    </>
  );
};

export default TodoList;
