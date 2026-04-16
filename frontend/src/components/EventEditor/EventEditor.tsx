import { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import type { Event } from '../../types/event';

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Work':
      return 'text-blue-600';
    case 'Personal':
      return 'text-rose-600';
    case 'Event':
      return 'text-orange-600';
    case 'Other':
      return 'text-gray-600';
    default:
      return 'text-pastel-700';
  }
};

interface EventEditorProps {
  onClose: () => void;
  editingEvent?: Event;
}

const ALARM_OPTIONS = [
  { label: '1주일 전', value: 7 * 24 * 60 },
  { label: '3일 전', value: 3 * 24 * 60 },
  { label: '2일 전', value: 2 * 24 * 60 },
  { label: '1일 전', value: 24 * 60 },
  { label: '3시간 전', value: 3 * 60 },
  { label: '2시간 전', value: 2 * 60 },
  { label: '1시간 전', value: 60 },
  { label: '30분 전', value: 30 },
];

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
  const [alarmEnabled, setAlarmEnabled] = useState(editingEvent?.alarmEnabled !== false);
  const [useTime, setUseTime] = useState(editingEvent?.useTime !== false);

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        description,
        startTime: useTime ? startTime : '00:00',
        endTime: useTime ? endTime : '00:00',
        category,
        alarm: alarmEnabled ? alarm : 0,
        alarmEnabled,
        useTime,
      });
    } else {
      addEvent({
        title,
        description,
        date: selectedDate,
        startTime: useTime ? startTime : '00:00',
        endTime: useTime ? endTime : '00:00',
        category,
        alarm: alarmEnabled ? alarm : 0,
        alarmEnabled,
        useTime,
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
          {/* 제목 - 카테고리 색상 미리보기 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              제목
            </label>
            <div className={`text-sm font-semibold mb-2 ${getCategoryColor(category)}`}>
              {title || '미리보기'}
            </div>
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

          {/* 시간 입력 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useTime"
              checked={useTime}
              onChange={(e) => setUseTime(e.target.checked)}
              className="w-4 h-4 rounded accent-pastel-400 cursor-pointer"
            />
            <label htmlFor="useTime" className="text-sm font-medium text-pastel-700 cursor-pointer">
              시간 설정
            </label>
          </div>

          {/* 시간 - useTime이 true일 때만 표시, 항상 1열(flex-col)로 카테고리/알람 폼과 동일 너비 */}
          {useTime && (
            <div className="flex flex-col gap-3">
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
          )}

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

          {/* 알람 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alarmEnabled"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-pastel-400 cursor-pointer"
            />
            <label htmlFor="alarmEnabled" className="text-sm font-medium text-pastel-700 cursor-pointer">
              알람 설정
            </label>
          </div>

          {/* 알람 옵션 - alarmEnabled가 true일 때만 표시 */}
          {alarmEnabled && (
            <div>
              <label className="block text-sm font-medium text-pastel-700 mb-1">
                알람 시간
              </label>
              <select
                value={alarm}
                onChange={(e) => setAlarm(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
              >
                {ALARM_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
