import { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import type { Event } from '../../types/event';

interface EventEditorProps {
  onClose: () => void;
  editingEvent?: Event;
}

const EventEditor: React.FC<EventEditorProps> = ({ onClose, editingEvent }) => {
  const { addEvent, updateEvent, selectedDate } = useEventStore();
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '09:00');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '10:00');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Event' | 'Other'>(
    editingEvent?.category || 'Personal'
  );
  const [alarm, setAlarm] = useState(editingEvent?.alarm || 15);

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        description,
        startTime,
        endTime,
        category,
        alarm,
      });
    } else {
      addEvent({
        title,
        description,
        date: selectedDate,
        startTime,
        endTime,
        category,
        alarm,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-pastel-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-pastel-700">
            {editingEvent ? '일정 수정' : '새 일정'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pastel-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="p-4 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
            />
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-pastel-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pastel-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
            >
              <option value="Personal">개인</option>
              <option value="Work">일</option>
              <option value="Event">행사</option>
              <option value="Other">기타</option>
            </select>
          </div>

          {/* 알람 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              알람 ({alarm}분 전)
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={alarm}
              onChange={(e) => setAlarm(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-pastel-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-pastel-300 text-pastel-700 rounded-lg hover:bg-pastel-50 transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-pastel-500 text-white rounded-lg hover:bg-pastel-600 transition"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
