import { useState, useRef, useEffect } from 'react';
import { useEventStore } from '../../store/eventStore';
import type { Event } from '../../types/event';

const getCategoryColor = (category: string): string => {
  switch (category) {
    case '업무':
      return 'text-green-600';
    case '일상':
      return 'text-yellow-600';
    case 'Event':
      return 'text-orange-600';
    case '가족':
      return 'text-amber-700';
    case '아이':
      return 'text-pink-700';
    case '마님':
      return 'text-red-600';
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

const SPECIAL_SYMBOLS = [
  "✖","✔","✓","☑","⊙","◉","◎","●","⬤","○",
  "◆","◇","◈","➜","←","↑","→","↓","↔",
  "~","≈","—","-","•",".","✕","☒","♥","♡",
  "✪","▶","▷","▸","▻","■","□","⋯"
];

const EventEditor: React.FC<EventEditorProps> = ({ onClose, editingEvent }) => {
  const { addEvent, updateEvent, selectedDate } = useEventStore();
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '09:00');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '10:00');
  const [category, setCategory] = useState<'업무' | '일상' | 'Event' | '가족' | '아이' | '마님'>(
    editingEvent?.category || '일상'
  );
  const [alarm, setAlarm] = useState(
    editingEvent?.alarm && editingEvent.alarm !== 0
      ? editingEvent.alarm
      : 30  // 기본값: 30분 전
  );
  // 새 일정이면 기본 꺼짐(false), 수정이면 저장된 상태 복원
  const [useTime, setUseTime] = useState(
    editingEvent ? (editingEvent.useTime === true) : false
  );
  const [useCategory, setUseCategory] = useState(
    editingEvent ? true : false
  );
  const [alarmEnabled, setAlarmEnabled] = useState(
    editingEvent ? (editingEvent.alarmEnabled === true) : false
  );
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const symbolPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (symbolPickerRef.current && !symbolPickerRef.current.contains(e.target as Node)) {
        setShowSymbolPicker(false);
      }
    };
    if (showSymbolPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSymbolPicker]);

  const insertSymbol = (symbol: string) => {
    const el = descriptionRef.current;
    if (!el) {
      setDescription(d => d + symbol);
      return;
    }
    const start = el.selectionStart ?? description.length;
    const end = el.selectionEnd ?? description.length;
    const next = description.slice(0, start) + symbol + description.slice(end);
    setDescription(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + symbol.length;
      el.focus();
    });
    setShowSymbolPicker(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    const eventData = {
      title,
      description,
      startTime: useTime ? startTime : '',
      endTime:   useTime ? endTime   : '',
      category:  useCategory ? category : '일상' as const,
      alarm:     alarmEnabled ? alarm : 0,
      alarmEnabled,
      useTime,
      useCategory,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent({ ...eventData, date: selectedDate });
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
            <div className={`text-sm font-semibold mb-2 px-1 rounded ${getCategoryColor(category)} ${category === '업무' ? 'bg-blue-100' : ''}`}>
              {title || '미리보기'}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              className={`w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400 ${category === '업무' ? 'bg-blue-100' : ''}`}
            />
          </div>

          {/* 설명 */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium text-pastel-700">설명</label>
              <div ref={symbolPickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowSymbolPicker(v => !v)}
                  title="특수기호 삽입"
                  className="text-base leading-none px-1.5 py-0.5 rounded border border-pastel-200
                             text-pastel-500 hover:bg-pastel-100 transition select-none"
                >
                  ✱
                </button>
                {showSymbolPicker && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-pastel-200
                                  rounded-lg shadow-lg p-2 grid grid-cols-10 gap-1 w-72">
                    {SPECIAL_SYMBOLS.map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbol(sym)}
                        className="w-6 h-6 flex items-center justify-center text-base rounded
                                   hover:bg-pastel-100 transition text-pastel-700"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
            />
          </div>

          {/* ── 시간 설정 ─────────────────────────── */}
          <div className="border border-pastel-200 rounded-lg overflow-hidden">
            {/* 체크박스 헤더 */}
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pastel-50 transition select-none">
              <input
                type="checkbox"
                checked={useTime}
                onChange={(e) => setUseTime(e.target.checked)}
                className="w-4 h-4 rounded accent-pastel-400 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm font-medium text-pastel-700">시간 설정</span>
              {useTime && startTime && (
                <span className="ml-auto text-xs text-pastel-500">
                  {startTime} ~ {endTime}
                </span>
              )}
            </label>
            {/* 펼쳐지는 내용 */}
            {useTime && (
              <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-pastel-100 bg-pastel-50">
                <div>
                  <label className="block text-xs font-medium text-pastel-600 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pastel-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-pastel-600 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pastel-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 카테고리 설정 ────────────────────── */}
          <div className="border border-pastel-200 rounded-lg overflow-hidden">
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pastel-50 transition select-none">
              <input
                type="checkbox"
                checked={useCategory}
                onChange={(e) => setUseCategory(e.target.checked)}
                className="w-4 h-4 rounded accent-pastel-400 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm font-medium text-pastel-700">카테고리 설정</span>
              {useCategory && (
                <span className={`ml-auto text-xs font-semibold ${getCategoryColor(category)}`}>
                  {{ 일상: '일상', 업무: '업무', Event: '행사', 가족: '가족', '아이': '아이', '마님': '마님' }[category]}
                </span>
              )}
            </label>
            {useCategory && (
              <div className="px-4 pb-4 pt-1 border-t border-pastel-100 bg-pastel-50">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full px-3 py-2 bg-white border border-pastel-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-400"
                >
                  <option value="일상">일상</option>
                  <option value="업무">업무</option>
                  <option value="Event">행사</option>
                  <option value="가족">가족</option>
                  <option value="아이">아이</option>
                  <option value="마님">마님</option>
                </select>
              </div>
            )}
          </div>

          {/* ── 알람 설정 ────────────────────────── */}
          <div className="border border-pastel-200 rounded-lg overflow-hidden">
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pastel-50 transition select-none">
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-pastel-400 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm font-medium text-pastel-700">알람 설정</span>
              {alarmEnabled && (
                <span className="ml-auto text-xs text-pastel-500">
                  {ALARM_OPTIONS.find(o => o.value === alarm)?.label ?? ''}
                </span>
              )}
            </label>
            {alarmEnabled && (
              <div className="px-4 pb-4 pt-1 border-t border-pastel-100 bg-pastel-50">
                <select
                  value={alarm}
                  onChange={(e) => setAlarm(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-pastel-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-400"
                >
                  {ALARM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
