import dayjs, { type Dayjs } from 'dayjs';
import type { Event } from '../types/event';

export const ALARM_OPTIONS = [
  { label: '1주일 전', value: 7 * 24 * 60 },
  { label: '3일 전', value: 3 * 24 * 60 },
  { label: '2일 전', value: 2 * 24 * 60 },
  { label: '1일 전', value: 24 * 60 },
  { label: '3시간 전', value: 3 * 60 },
  { label: '2시간 전', value: 2 * 60 },
  { label: '1시간 전', value: 60 },
  { label: '30분 전', value: 30 },
];

// 알람 시각이 지난 뒤에도 이 시간(분) 안에 앱을 열면 놓친 알람을 울려준다
export const ALARM_CATCH_UP_MINUTES = 10;

const FIRED_STORAGE_KEY = 'raraCalendarFiredAlarms';
const FIRED_KEEP_DAYS = 8;

export const getAlarmLabel = (minutes: number): string =>
  ALARM_OPTIONS.find(o => o.value === minutes)?.label ?? `${minutes}분 전`;

// 알람 울릴 시각 계산 (알람 켜짐 + 시간 설정 + 시작 시간이 있어야 함)
export const getAlarmTime = (
  event: Pick<Event, 'date' | 'startTime' | 'alarm' | 'alarmEnabled' | 'useTime'>
): Dayjs | null => {
  if (!event.alarmEnabled || !event.useTime) return null;
  if (!event.alarm || event.alarm <= 0 || !event.startTime) return null;

  const start = dayjs(`${event.date} ${event.startTime}`);
  if (!start.isValid()) return null;
  return start.subtract(event.alarm, 'minute');
};

// 서버 푸시용 알람 필드. 시간대 문제를 피하려고 기기(한국 시간)에서 UTC 시각으로 계산해 저장한다.
// 알람 시각이 바뀌면 다시 발송되도록 alarmSent를 초기화한다.
export const getPushAlarmFields = (
  event: Pick<Event, 'date' | 'startTime' | 'alarm' | 'alarmEnabled' | 'useTime'>,
  prev?: Pick<Event, 'alarmAt' | 'alarmSent'>
): { alarmAt: string | null; alarmSent: boolean } => {
  const alarmAt = getAlarmTime(event)?.toISOString() ?? null;
  const unchanged = prev !== undefined && prev.alarmAt === alarmAt;
  return { alarmAt, alarmSent: unchanged ? prev.alarmSent === true : false };
};

// ── 이미 울린 알람 기록 (중복 방지) ──────────────────
// 키에 알람 시각을 포함해서, 일정 시간을 바꾸면 다시 울릴 수 있게 한다
const firedKey = (eventId: string, alarmTime: Dayjs) => `${eventId}|${alarmTime.toISOString()}`;

const loadFired = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(FIRED_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveFired = (fired: Record<string, number>) => {
  const cutoff = Date.now() - FIRED_KEEP_DAYS * 24 * 60 * 60 * 1000;
  const pruned = Object.fromEntries(Object.entries(fired).filter(([, t]) => t > cutoff));
  try {
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // 저장 실패 시 무시 (최악의 경우 알람이 한 번 더 울림)
  }
};

export const isAlarmFired = (eventId: string, alarmTime: Dayjs) =>
  firedKey(eventId, alarmTime) in loadFired();

export const markAlarmFired = (eventId: string, alarmTime: Dayjs) => {
  const fired = loadFired();
  fired[firedKey(eventId, alarmTime)] = Date.now();
  saveFired(fired);
};

// ── 알림 권한 / 표시 ────────────────────────────────
export const getNotificationPermission = (): NotificationPermission | 'unsupported' =>
  'Notification' in window ? Notification.permission : 'unsupported';

// 사용자 클릭(체크박스 등) 안에서 호출해야 iOS에서도 권한 요청이 뜬다
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

// 모바일(안드로이드 크롬, iOS 홈 화면 앱)은 new Notification()을 지원하지 않으므로
// 서비스워커의 showNotification을 우선 사용한다
export const showAlarmNotification = async (event: Event) => {
  const title = '📅 Rara Calendar';
  const options: NotificationOptions = {
    body: `${event.title} — ${dayjs(event.date).format('M월 D일')} ${event.startTime} 시작 (${getAlarmLabel(event.alarm)} 알림)`,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: event.id,
    data: { url: '/' },
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>(resolve => setTimeout(() => resolve(null), 3000)),
      ]);
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // 아래 fallback 사용
    }
  }

  try {
    new Notification(title, options);
  } catch (error) {
    console.error('알림 표시 실패:', error);
  }
};
