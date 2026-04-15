import { useEventStore } from '../../store/eventStore';
import { getTodayDate, getRelativeDateString } from '../../utils/dateHelper';
import type { Event } from '../../types/event';

interface EventDisplayProps {
  onOpenEventEditor: (event?: Event) => void;
  onOpenTodoList?: () => void;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ onOpenEventEditor, onOpenTodoList }) => {
  const { events, selectedDate, setSelectedDate, deleteEvent } = useEventStore();
  const today = getTodayDate();

  const selectedEvents = events.filter(event => event.date === selectedDate);
  const previousEventDate = events
    .filter(event => event.date < selectedDate)
    .map(e => e.date)
    .sort()
    .reverse()[0];
  const nextEventDate = events
    .filter(event => event.date > selectedDate)
    .map(e => e.date)
    .sort()[0];

  const handlePrevEvent = () => {
    if (previousEventDate) {
      setSelectedDate(previousEventDate);
    }
  };

  const handleNextEvent = () => {
    if (nextEventDate) {
      setSelectedDate(nextEventDate);
    }
  };

  const handleToday = () => {
    setSelectedDate(today);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      deleteEvent(eventId);
    }
  };

  const isToday = selectedDate === today;
  const relativeDate = getRelativeDateString(selectedDate);

  return (
    <div className="bg-pastel-50 border-t-2 border-pastel-200 flex flex-col flex-1">
      {/* 날짜 표시 - "~일 후" 부분만 표시 */}
      {!isToday && relativeDate && (
        <div className="px-4 py-2 bg-white border-b border-pastel-200 text-center">
          <span className="text-sm text-pastel-orange font-semibold">
            {relativeDate}
          </span>
        </div>
      )}

      {/* 일정 리스트 - 하단 고정 바 높이(56px)만큼 패딩 확보 */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto pb-16">
        {selectedEvents.length === 0 ? (
          <div className="text-center text-pastel-400 py-6">
            <p>등록된 일정이 없습니다</p>
          </div>
        ) : (
          selectedEvents.map(event => (
            <div
              key={event.id}
              className="bg-white p-3 rounded-lg border border-pastel-200 hover:shadow-md transition cursor-pointer"
              onClick={() => onOpenEventEditor(event)}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="font-semibold text-pastel-700">{event.title}</div>
                  <div className="text-xs text-pastel-500 mt-1">
                    {event.startTime} ~ {event.endTime}
                  </div>
                  {event.description && (
                    <div className="text-xs text-pastel-600 mt-2">{event.description}</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="p-1 hover:bg-red-100 rounded transition"
                  title="삭제"
                >
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 컨트롤 바 - 스크롤과 무관하게 화면 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pastel-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {/* 좌/우 이동 버튼 */}
            <button
              onClick={handlePrevEvent}
              disabled={!previousEventDate}
              className="p-2 text-pastel-500 hover:bg-pastel-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="이전 일정"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Today 버튼 */}
            <button
              onClick={handleToday}
              className="px-4 py-2 text-pastel-orange rounded-lg transition font-semibold hover:bg-pastel-50"
            >
              Today
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={() => {
                if (selectedEvents.length > 0) {
                  const confirmed = confirm('이 날짜의 모든 일정을 삭제하시겠습니까?');
                  if (confirmed) {
                    selectedEvents.forEach(event => deleteEvent(event.id));
                  }
                }
              }}
              disabled={selectedEvents.length === 0}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="삭제"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* 다음 일정 버튼 */}
            <button
              onClick={handleNextEvent}
              disabled={!nextEventDate}
              className="p-2 text-pastel-500 hover:bg-pastel-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="다음 일정"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            {/* Todo 버튼 */}
            {onOpenTodoList && (
              <button
                onClick={onOpenTodoList}
                className="px-4 py-2 text-pastel-orange rounded-lg transition font-semibold hover:bg-pastel-50"
              >
                Todo
              </button>
            )}

            {/* Add 버튼 */}
            <button
              onClick={() => onOpenEventEditor()}
              className="px-4 py-2 bg-pastel-400 text-white rounded-lg hover:bg-pastel-500 transition font-semibold"
            >
              + add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDisplay;
