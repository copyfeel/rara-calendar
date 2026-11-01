import { useState, useRef, useEffect } from 'react';
import ImportantStar from '../ImportantStar/ImportantStar';
import { useEventStore } from '../../store/eventStore';
import type { Event } from '../../types/event';
import {
  ALARM_OPTIONS,
  getAlarmTime,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../utils/alarm';

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
    case '학원':
      return 'text-olive-700';
    default:
      return 'text-pastel-700';
  }
};

interface EventEditorProps {
  onClose: () => void;
  editingEvent?: Event;
}

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
  const [category, setCategory] = useState<Event['category']>(
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
  const [notifyPermission, setNotifyPermission] = useState(getNotificationPermission());
  const [important, setImportant] = useState(editingEvent?.important === true);
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

  // 알람은 시작 시간 기준이라 알람을 켜면 시간 설정도 함께 켠다.
  // 권한 요청은 사용자 클릭 안에서 해야 iOS에서도 동작한다.
  const handleAlarmToggle = async (checked: boolean) => {
    setAlarmEnabled(checked);
    if (!checked) return;
    if (!useTime) setUseTime(true);
    setNotifyPermission(await requestNotificationPermission());
  };

  const alarmTime = getAlarmTime({
    date: editingEvent?.date || selectedDate,
    startTime,
    alarm,
    alarmEnabled,
    useTime,
  });

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
      important,
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
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium text-pastel-700">설명</label>
              <div ref={symbolPickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowSymbolPicker(v => !v)}
                  title="특수기호 삽입"
                  className="w-[25px] h-[20px] flex items-center justify-center text-base leading-none rounded border border-pastel-200
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
              {/* 중요 날짜 표시: 켜면 캘린더 날짜 옆에 빨간 별 */}
              <button
                type="button"
                onClick={() => setImportant(v => !v)}
                title="중요 날짜 표시"
                aria-pressed={important}
                className={`w-[25px] h-[20px] flex items-center justify-center rounded border transition select-none ${
                  important
                    ? 'border-red-300 bg-red-50 text-red-500'
                    : 'border-pastel-200 text-pastel-400 hover:bg-pastel-100'
                }`}
              >
                <ImportantStar size={12} strokeWidth={1.6} filled={important} />
              </button>
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
                  {{ 일상: '일상', 업무: '업무', Event: '행사', 가족: '가족', '아이': '아이', '마님': '마님', '학원': '학원' }[category]}
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
                  <option value="학원">학원</option>
                </select>
              </div>
            )}
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

          {/* ── 알람 설정 ────────────────────────── */}
          <div className="border border-pastel-200 rounded-lg overflow-hidden">
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pastel-50 transition select-none">
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => handleAlarmToggle(e.target.checked)}
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
                {/* 알람 안내 */}
                <p className="mt-2 text-xs leading-relaxed">
                  {!useTime ? (
                    <span className="text-red-500">시간 설정을 켜야 알람이 울립니다 (시작 시간 기준)</span>
                  ) : alarmTime && alarmTime.isBefore(new Date()) ? (
                    <span className="text-red-500">알람 시각({alarmTime.format('M월 D일 HH:mm')})이 이미 지났습니다</span>
                  ) : alarmTime ? (
                    <span className="text-pastel-500">{alarmTime.format('M월 D일 HH:mm')}에 알림이 울립니다</span>
                  ) : null}
                  {notifyPermission === 'denied' && (
                    <span className="block text-red-500">
                      브라우저 알림이 차단되어 있습니다. 브라우저 설정에서 이 사이트의 알림을 허용해주세요
                    </span>
                  )}
                  {notifyPermission === 'unsupported' && (
                    <span className="block text-red-500">
                      이 브라우저는 알림을 지원하지 않습니다 (아이폰은 홈 화면에 추가한 앱에서만 가능)
                    </span>
                  )}
                  <span className="block text-pastel-400">앱이 열려 있을 때 울립니다</span>
                </p>
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
