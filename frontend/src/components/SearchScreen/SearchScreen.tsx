import { useState } from 'react';
import { useEventStore } from '../../store/eventStore';

const SearchScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { events, deleteEvent } = useEventStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const filteredEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const handleSelectEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm('선택한 일정을 삭제하시겠습니까?')) {
      selectedEvents.forEach(id => deleteEvent(id));
      setSelectedEvents(new Set());
      setEditMode(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-pastel-200 p-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-pastel-700">검색</span>
          <div className="flex gap-2">
            {editMode ? (
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedEvents(new Set());
                }}
                className="px-3 py-1 text-sm text-pastel-700 hover:bg-pastel-100 rounded"
              >
                취소
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1 text-sm text-pastel-700 hover:bg-pastel-100 rounded"
              >
                편집
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-pastel-700 hover:bg-pastel-100 rounded"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="p-4 border-b border-pastel-200">
          <input
            type="text"
            placeholder="일정 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
          />
        </div>

        {/* 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-pastel-400">
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-pastel-200">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-3 hover:bg-pastel-50 transition flex items-center gap-3 ${
                    editMode ? 'pl-8' : ''
                  }`}
                >
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.id)}
                      onChange={() => handleSelectEvent(event.id)}
                      className="rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-pastel-700 truncate">
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

        {/* 편집 모드 바닥글 */}
        {editMode && (
          <div className="sticky bottom-0 bg-pastel-50 border-t border-pastel-200 p-3 flex justify-between">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm text-pastel-700 hover:bg-white rounded"
            >
              {selectedEvents.size === filteredEvents.length ? '선택 해제' : '전체 선택'}
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedEvents.size === 0}
              className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
