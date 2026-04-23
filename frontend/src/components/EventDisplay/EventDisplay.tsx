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
  '겉으로 보이는 가격만 보지말고, 진짜 가치를 알아 보는 눈이 필요하다',
  '오늘 나무 그늘에 앉아 있을 수 있는 것은, 오래전에 누군가 나무를 심었기 때문이다',
  '말만 하지 말고 뭐라도 하자',
  '어제는 지나갔고 내일은 아직 오지 않았다. 지금 우리에게는 오늘만 있습니다',
  '시간이 부족하다고 탓하지말고 남은 시간에 최선을 다하자',
  '오늘 걷지 않으면 내일은 뛰어야 한다',
  '인생이란 공평하지 않을 때가 많다, 이 사실에 익숙해져라',
  '인생이 공평하지 않다는 것이 당연하다는 것을 인정한 뒤, 마음이 편안해졌다',
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
  'Sometimes, you have to take a leap and trust the universe, 가끔은 과감하게 뛰어들고 인생을 믿어야 해',
  'You have to decide your life.',
  'Your life is here now.',
  '옳은 일을 하는 것은 절대 틀리지 않는다',
  '경험은 절대 늙지 않는다',
  '괜찮아, 천천히 가도 돼',
  "It's okay to take a break, 잠시 쉬어가도 괜찮아",
  '당신이 부족한 것보다, 당신이 가진 것을 생각하라',
  '자신의 것이 아닌 것을 탐내지 마라',
  '다른 사람들을 비난하거나 욕하지 마라',
  '인간은 실수하게 마련이며, 용서 받지 못할 실수는 없다',
  '자연은 우리를 위한 것이 아니라 우리의 일부다',
  '언제 어디서나 진실하게 행동해라',
  '함께 걸어도 누구도 너의 길을 대신 갈 수 없다',
  '대지를 잘 보살펴라, 그것은 조상으로부터 물려받은 것이 아나라, 우리의 후손으로부터 빌려온 것이다',
  '내 뒤에서 걷지 말고 내 옆에서 걸어라, 우리가 하나가 되도록',
  '누구에게도 의지하지 말고 혼자의 힘으로 행하라',
  '울기를 두려워 하지 마라, 눈물은 마음의 아픔을 씻어내는 약이다',
  '나의 땀과 노력이 스며들지 않은 것은 내것이 아니다',
  '적게 먹고 적게 말하면 삶에 아무런 문제가 없다',
  '사람이 죽는 것은 한 개의 문이 닫히고, 다른 문이 열리는 것과 같다',
  '정직은 생명을 가진 모든 존재가 거쳐야 할 시험이다',
  '가장 현명하고 훌륭한 인간에게도 불행은 닥치는 법이다',
  '빨리 가려거든 혼자 가고 멀리 가려거든 함께 가라',
  '매일 새로운 순간에 마음을 쏟아야 한다',
  '두려움은 당신이 두려워하는 그 일을 할때, 비로소 없어진다',
  '부정적인 생각은, 육체의 질병을 일으키고 마음과 영혼에 상처를 주니, 항상 긍정적이고 밝은 면을 보는 습관을 길러라',
  '네가 태어났을때 너는 울었고 세상은 기뻐했다. 네가 죽었을때 세상이 울고 너는 기쁠 수 있도록 삶을 살아라',
  '나무가 되려거든 혼자 서고, 숲이 되려거든 함께 서라',
  '스스로를 돌보지 않으면서 타인을 돕는건 진정한 봉사가 아니다',
  'The Earth is our Mother, care for her.',
  'Honor all your relations.',
  'Open your heart and soul to the Great Spirit.',
  '모든 생명은 신성하다, 모든 존재를 존중하라',
  '대지에서 필요한 것만 취하고, 그 이상은 취하지 마라',
  '모두의 이익을 위해 해야할 일을 해라',
  '진실을 말하되, 다른 사람에게 도움이 되도록 말해라',
  'Follow the rhythms of Nature',
  '인생의 여정을 즐기되, 흔적을 남기지 마라',
  '진실된 말은 무거운 돌처럼 가슴 깊이 가라 앉기 때문에, 결코 잊어 버리지 않는다',
  '말이 없다면 그것도 하나의 답이다',
  '친구란, 내 슬픔을 자기 등에 지고 가는 사람이다',
  '너무 빨리 달려서 행여나 내 영혼이 따르지 못한다고 생각되면, 잠시 멈춤줄 알아야 한다',
  '서두르면 놓치는 것이 생긴다',
  '스스로를 비난하는 사람이 될지, 자신을 사랑하는 사람이 될지는 자신의 몫이다',
  '사람의 눈은 혀가 말할 수 없는 것을 말한다',
  '가슴으로 물어라, 그러면 가슴에서 나오는 대답을 듣게 될 것이다',
  '눈이 아니라 가슴으로 판단해라',
  '더 많이 줄수록 더 많은 좋은 것이 그대에게 돌아온다',
  '만 번을 말하면 현실로 이루어진다',
  '그렇게 될 일은 결국 그렇게 된다',
  '죽은 말을 타고 있음을 깨닫는다면 당장 내려라',
  '객관적으로 말하는데, 내 주관에 토 달지마',
  '배움을 얻는 방법은 책을 읽거나, 똑똑한 사람들과 함께하는 것이다',
  '마음의 길을 따라 걸어라',
  '삶은 우리의 계획을 따르지 않기 때문에, 오히려 놀라운 일이 가능하다',
  '안되면 될꺼 해라',
  '거짓말은 눈사람과 같아서 오래 굴리면 그만큼 커진다',
  '살아 보기 전까진 인생이 어떤 것인지 알 수 없다',
  '뽑으려 하니 모두 잡초였고, 품으려 하니 모두가 꽃이었습니다',
  '사람들은 달에 갈 생각만 하느라, 자기 발밑에 핀 꽃을 보지 못한다',
  '하늘을 나는 충동을 느낄때, 땅을 기라는 말엔 결코 동의할 수 없다',
  '냉정해져라, 아닌 건 후회없이 자를 수 있도록',
  '아픔 담지 마세요, 아프게 한 사람에게 양보하세요',
  '선물로 친구를 사지마라, 선물을 주지 않으면 그 친구의 사랑도 끝날 것이다',
  '보지 않는 곳에서 나를 좋게 말하는 사람이 진정한 친구다',
  '친구는 온 세상이 나의 곁을 떠났을때, 나를 찾아오는 사람이다',
  '오늘이 가장 큰 선물입니다',
  '너는 커피를 좋아하고 나는 그런 너를 좋아해',
  '행복한 순간은 하루에도 몇번씩 우리를 지나간다, 지금 이 순간에도',
  '그런 사람 또 없습니다',
  '그냥 좋은 것이 가장 좋은 것입니다',
  '명랑하게 살아라, 인간은 다 죽는다',
  '속마음은 쉽게 드러내지 마라',
  '나는 해야 한다, 그러므로 나는 할 수 있다',
  '항상 갈망하라, 늘 우직하게 도전하라',
  '기본만 해도 훌륭하다',
  '건강할때 행복을 알았더라면, 병들었을때 후회하지 않았을 것이다',
  '건강을 잃으면 전부를 잃는 것이다',
  '잠은 최고의 명약이다',
  '운동은 모든 행복의 열쇠다',
  '마음의 상처는 몸의 상처 보다 오래 간다',
  '건강은 행복의 첫 번째 조건이다',
  '건강은 우리가 가진 가장 큰 재산이다',
  '건강할때 행복을 느끼지 못한다면, 그것은 가장 큰 불행이다',
  '건강은 돈으로 살 수 없지만, 돈은 건강으로 벌 수 있다',
  '건강한 사람은 천 가지 소원이 있고, 병든 사람은 한 가지 소원 밖에 없다',
  '운동은 하루를 짧게 하지만 인생을 길게 해준다',
  '운동을 하지 않으면 어느 순간 당신은 고장날 것이다',
  '말하기 전에 한 번 더 생각한다',
  '물을 마시지 않으면 피부가 늙고, 잠을 자지 않으면 눈이 늙고, 책을 읽지 않으면 생각이 늙는다, 그리고 사람을 만나지 않으면 마음이 늙는다',
  '필요 없는 물건은 쌓아두지 않는다',
  '몸이 보내는 휴식 신호를 무시하지 않는다',
  '균형 잡힌 식단은 건강의 기초다',
  '몸이 보내는 작은 신호를 무시하지 마라',
  '병은 갑자기 오지만, 건강은 천천히 온다',
  '작은 예의가 큰 차이를 만든다',
  '힘들수록 기본으로 돌아가라',
  '가까운 사람일수록 함부로 대하지마라',
  '살기 위해 먹을 것인가, 먹기 위해 살것인가',
  '평범한 하루가 소중함을 잊지말자',
  '음악은 영혼의 향연이다',
  '예술은 우리에게 진실을 깨달게 하는 거짓이다',
  '세계적이려면 가장 민족적이어야 하지 않을까?',
  '나는 작업할 때 예술에 대해 생각하지 않는다, 삶에 대해 생각한다',
  '예술은 당신이 무엇을 보는가가 아니라, 어떻게 보는가에 관한 것이다',
  '예술은 생각의 눈이다',
];

// 줄바꿈 규칙: 구두점 뒤 즉시 줄바꿈, 한글 34자 초과 또는 영어 46자 초과시 줄바꿈
const formatQuote = (text: string): string[] => {
  const breakChars = new Set([',', '.', '!', '?']);
  const isKorean = (ch: string) => ch >= '\uAC00' && ch <= '\uD7A3';
  const isEnglish = (ch: string) => (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
  const lines: string[] = [];
  let currentLine = '';
  let koreanCount = 0;
  let englishCount = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    currentLine += char;
    if (isKorean(char)) koreanCount++;
    else if (isEnglish(char)) englishCount++;

    const isBreakChar = breakChars.has(char);
    const isLast = i === text.length - 1;
    const limitReached = koreanCount > 34 || englishCount > 46;

    if (!isLast && (isBreakChar || limitReached)) {
      lines.push(currentLine.trim());
      currentLine = '';
      koreanCount = 0;
      englishCount = 0;
      if (isBreakChar && i + 1 < text.length && text[i + 1] === ' ') i++;
    }
  }

  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines.filter(l => l.length > 0);
};

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
                {formatQuote(randomQuote).map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
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
