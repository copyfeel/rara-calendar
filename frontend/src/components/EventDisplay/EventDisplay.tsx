import { useState, useRef, useEffect, useMemo } from 'react';
import { useEventStore } from '../../store/eventStore';
import { getTodayDate, getRelativeDateString } from '../../utils/dateHelper';
import type { Event } from '../../types/event';

const EMPTY_QUOTES = [
  '예주야, 인생 짧다! 하고 싶은거 하고 살아',
  '우리가 가진 귀중한 자원은 시간이다',
  '실패를 두려워하면 멀리 갈 수 없다',
  '작은 일도 잊지 못할 추억으로 만들자',
  '변명으로 사과를 망치지 마라',
  '성공하지 못했다면 충분히 실패하지 않았다는 뜻이다',
  '무언가에 투자하기 전에, 그것을 이해하기 위해 시간을 투자해라',
  '작은 비용에 주의해라, 작은 누수가 큰 배를 가라앉힌다',
  '모른다는 것은 부끄러운 일이 아니다, 배우려 하지 않는 것이 더 부끄러운 일이다',
  "Don't just live a life; build one.",
  '관심을 두지 않으면 모든 것은 잊혀진다',
  '기본에 충실하면 흔들리지 않는다',
  '인사만 잘해도 공짜 떡이 생긴다',
  '이 또한 지나가리라',
  '소통은 상대를 이해하는 마음에서 시작된다',
  '매너가 사람을 만든다',
  '사랑 받고 싶다면 사랑해라, 그리고 사랑스럽게 행동해라',
  '내일 죽을 것처럼 살아라',
  '성찰하지 않는 삶은 살 가치가 없다',
  '삶은 매 순간 내리는 선택들의 결과다',
  '친구라면 친구의 결점을 참고 견뎌야 한다',
  '아이는 말이 아니라 행동으로 보고 배운다',
  '부모가 삶으로 보여주는 행동이 최고의 교육이다',
  '사랑은 가정에서 시작된다',
  '가족들이 서로 맺어져 하나가 되어 있다는 것은 정말 행복이다',
  '삶은 끊임없는 배움이다',
  '배우는 것은 평생 지속되는 즐거움이다',
  '독서를 통해 사고를 넓혀라',
  '작은 습관이 큰 변화를 만든다',
  '인간관계는 넓이가 아니라 깊이다',
  '많은 친구를 두기보다, 진실한 친구 한 명을 얻는 것이 더 큰 행복이다',
  '내 뒤에서 나를 말하는 사람보다, 내 옆에서 조용히 지켜주는 사람을 기억해라',
  '자기 자신에게 투자하라',
  '위험은 모를 때 생긴다',
  '겉으로 보이는 가격만 보지말고 진짜 가치를 알아 보는 눈이 필요하다',
  '오늘 누군가 그늘에 앉아 있을 수 있는 것은 오래전에 누군가 나무를 심었기 때문이다',
  '말만 하지 말고 뭐라도 하자',
  '어제는 지나갔고 내일은 아직 오지 않았다. 우리에게는 오늘만 있습니다. 자, 시작해 보자!',
  '시간이 부족하다고 탓하지말고 남은 시간에 최선을 다하자',
  '오늘 걷지 않으면 내일은 뛰어야 한다',
  '인생이란 공평하지 않을 때가 많다, 이 사실에 익숙해져라',
  '인생이 공평하지 않다는 것이 당연하다는 것을 인정한 뒤 마음이 편안해졌다',
  '인생에는 되감기 버튼이 없다',
  "Life is not fair; get used to it",
  "It's not that I'm so smart, It's just that I stay with problems longer.",
  'Stay hungry, stay foolish',
  '남의 인생을 대신 살지 말아라',
  '비교는 행복의 도둑이다',
  '정직은 최고의 전략이다',
  '네가 사랑하는 일을 찾아라, 그러면 평생 단 하루도 일하지 않는 기분으로 살게 될 것이다',
  '오늘의 선택이 내일의 너를 만든다',
  'To me, you are perfect',
  '편견은 내가 다른 사람과 사랑에 빠지는 것을 방해하고, 오만은 다른 사람을 내게서 멀어지게 한다',
  '인생은 축복이니 낭비하면 안 됩니다, 미래는 아무도 모르는 법이니까요',
  '사람들은 다른 사람들의 열정에 끌리게 되어 있다',
  '그 사람이 듣는 음악을 보면, 그 사람에 대해 많은 것을 알 수 있어요',
  '평범함도 어느 순간, 갑자기 진주처럼 아름답게 빛나거든',
  '타인의 잘못에 내가 무너질 필요는 없다',
  '음악은 평범한 순간도 아름답게 바꿔줘',
  '시작하기에 늦은 나이는 없다',
  '마음을 담지 않으면 의미가 없다',
  '네가 사랑하는 걸 찾아라',
  '사랑은 환상이 아니라 이해하는 것이다',
  '무너짐은 선물이고, 변화로 가는 길이다',
  '사랑 때문에 균형을 잃는 것도 삶의 일부다',
  '난 평생 널 사랑해왔던거 같아, 사랑은 늦게 깨달을 수도 있다',
  '꿈 없이 살 수는 있지만, 그건 삶이라 하긴 어렵지',
  "사랑은 '지금'을 함께 하는 것이다",
  '포기하지 않는 마음이 관계를 이어준다',
  '사랑은 같은 방향을 바라보는 것이고, 함께하려는 의지다',
  "If you're a bird, I'm a bird",
  '사람은 각자 다른 빛깔을 가지고 있다',
  'Sometimes you have to take a leap and trust the universe, 가끔은 과감하게 뛰어들고 인생을 믿어야 해',
  'You have to decide your life.',
  'Your life is here now.',
  '옳은 일을 하는 것은 절대 틀리지 않는다',
  '경험은 절대 늙지 않는다',
  '괜찮아, 천천히 가도 돼',
  "It's okay to take a break, 잠시 쉬어가도 괜찮아",
  '당신이 부족한 것보다, 당신이 가진 것을 생각하라',
];

// 20자 이상이면 절반 지점 근처 공백/쉼표에서 줄바꿈
const formatQuote = (text: string): string[] => {
  if (text.length < 20) return [text];
  const mid = Math.ceil(text.length / 2);
  let breakPoint = mid;
  for (let i = mid; i >= mid - 8 && i > 0; i--) {
    if (text[i] === ' ' || text[i] === ',') {
      breakPoint = i + 1;
      break;
    }
  }
  return [text.substring(0, breakPoint).trim(), text.substring(breakPoint).trim()];
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case '업무':
      return 'text-green-600';
    case '카피':
      return 'text-yellow-600';
    case 'Event':
      return 'text-orange-600';
    case '가족':
      return 'text-amber-700';
    case '예주':
      return 'text-pink-700';
    case '마님':
      return 'text-red-600';
    default:
      return 'text-pastel-700';
  }
};

interface EventDisplayProps {
  onOpenEventEditor: (event?: Event) => void;
  onOpenTodoList?: () => void;
  onMonthChange?: (date: Date) => void;
  isPC?: boolean;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ onOpenEventEditor, onOpenTodoList, onMonthChange, isPC = false }) => {
  const { events, selectedDate, setSelectedDate, deleteEvent } = useEventStore();
  const today = getTodayDate();
  const [hideBottomBar, setHideBottomBar] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 날짜 바뀔 때마다 랜덤 문구 선택
  const randomQuote = useMemo(() => {
    const idx = Math.floor(Math.random() * EMPTY_QUOTES.length);
    return EMPTY_QUOTES[idx];
  }, [selectedDate]);

  // 모바일 전용: 스크롤 감지 → 하단 바 자동 숨김/표시
  useEffect(() => {
    if (isPC) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;

      if (scrollTop > 20) {
        setHideBottomBar(true);
      } else {
        // 최상단으로 돌아오면 즉시 표시
        setHideBottomBar(false);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        return;
      }

      // 스크롤 멈추면 800ms 후 표시
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setHideBottomBar(false);
      }, 800);
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isPC]);

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
    if (onMonthChange) {
      const todayDate = new Date(today);
      onMonthChange(todayDate);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      deleteEvent(eventId);
    }
  };

  const isToday = selectedDate === today;
  const relativeDate = getRelativeDateString(selectedDate);

  return (
    <div className="bg-pastel-50 border-t-2 border-pastel-200 flex flex-col flex-1 overflow-hidden">
      {/* 날짜 표시 - "~일 후" 부분만 표시 */}
      {!isToday && relativeDate && (
        <div className="px-4 py-2 bg-white border-b border-pastel-200 text-left flex-shrink-0">
          <span className="text-sm text-pastel-600 font-semibold">
            + {relativeDate}
          </span>
        </div>
      )}

      {/* 일정 리스트 - 스크롤 가능 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="p-4 space-y-3 pb-24">
          {selectedEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-32 px-6 text-center">
              <p className="text-pastel-400 text-sm leading-relaxed">
                {formatQuote(randomQuote).map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < formatQuote(randomQuote).length - 1 && <br />}
                  </span>
                ))}
              </p>
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
                    <div className={`font-semibold ${getCategoryColor(event.category)}`}>{event.title}</div>
                    {event.useTime && (
                      <div className="text-xs text-pastel-500 mt-1">
                        {event.startTime} ~ {event.endTime}
                      </div>
                    )}
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
      </div>

      {/* 하단 컨트롤 바 */}
      <div
        className="fixed bottom-0 z-50 bg-white border-t border-pastel-200 px-4 py-3 safe-area-bottom"
        style={{
          left: isPC ? 'calc(50% - 15%)' : '0',
          right: isPC ? 'auto' : '0',
          width: isPC ? '30%' : '100%',
          transform: !isPC && hideBottomBar ? 'translateY(150%)' : 'translateY(0)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
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

            <button
              onClick={handleToday}
              className="px-4 py-2 text-pastel-orange rounded-lg transition font-semibold hover:bg-pastel-50"
            >
              Today
            </button>

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
            {onOpenTodoList && (
              <button
                onClick={onOpenTodoList}
                className="px-4 py-2 text-pastel-orange rounded-lg transition font-semibold hover:bg-pastel-50"
              >
                Todo
              </button>
            )}

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
