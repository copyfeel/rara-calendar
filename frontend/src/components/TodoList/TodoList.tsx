import { useState, useEffect, useRef } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getNextDaysEvents, getKoreanDayOfWeek } from '../../utils/dateHelper';

interface TodoListProps {
  onClose: () => void;
  calendarBottom?: number;
}

const CLOSE_THRESHOLD = 80; // 80px 이상 드래그하면 닫힘

const TodoList: React.FC<TodoListProps> = ({ onClose, calendarBottom = 0 }) => {
  const { events } = useEventStore();
  const [completedEvents, setCompletedEvents] = useState<Set<string>>(new Set());

  // ── 슬라이드 상태 ──
  const [visible, setVisible] = useState(false);       // 열림/닫힘 애니메이션
  const [dragY, setDragY] = useState(0);               // 드래그 이동량(px)
  const [isDragging, setIsDragging] = useState(false); // 드래그 진행 중
  const dragStartY = useRef(0);                        // 드래그 시작 Y 위치

  const upcomingEvents = getNextDaysEvents(events, 10);

  // 마운트 후 슬라이드 업 시작
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // ── 닫기 (슬라이드 다운 후 언마운트) ──
  const handleClose = () => {
    setDragY(0);
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleToggleComplete = (eventId: string) => {
    const next = new Set(completedEvents);
    if (next.has(eventId)) next.delete(eventId);
    else next.add(eventId);
    setCompletedEvents(next);
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
    // 위로는 당기지 않음 (0 이하 클램프)
    setDragY(Math.max(0, delta));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragY >= CLOSE_THRESHOLD) {
      // 임계값 초과 → 닫기
      handleClose();
    } else {
      // 미달 → 원위치 복귀
      setDragY(0);
    }
  };

  // ── 패널 transform / transition ──
  const panelTransform = isDragging
    ? `translateY(${dragY}px)`           // 드래그 중: 실시간 이동
    : visible
      ? 'translateY(0)'                  // 열림 상태
      : 'translateY(100%)';              // 닫힘 애니메이션

  const panelTransition = isDragging
    ? 'none'                             // 드래그 중엔 transition 끔 (즉각 반응)
    : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  // 최대 높이: 화면 하단 ~ 캘린더 하단
  const maxHeight = calendarBottom > 0
    ? `${window.innerHeight - calendarBottom}px`
    : '50vh';

  return (
    <>
      {/* 반투명 오버레이 – 캘린더 아래만, 클릭하면 닫힘 */}
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
          transform: panelTransform,
          transition: panelTransition,
        }}
      >
        {/* ── 헤더 + 드래그 핸들 (터치로 아래로 당겨 닫기) ── */}
        <div
          className="flex-shrink-0 bg-white border-b border-pastel-100 px-4 py-3 flex items-center justify-between relative select-none"
          style={{ cursor: 'grab', touchAction: 'none' }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* 핸들 바 (드래그 힌트) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-pastel-300 rounded-full" />

          <h2 className="text-sm font-semibold text-pastel-700 mt-1">
            오늘부터 10일 일정
          </h2>

          {/* ❶ X 버튼으로 닫기 */}
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

        {/* ── 일정 리스트 (스크롤 가능) ── */}
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
                      {event.date} {getKoreanDayOfWeek(event.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* iOS Safe Area 여백 */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
    </>
  );
};

export default TodoList;
