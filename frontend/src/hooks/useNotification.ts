import { useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';

export const useNotification = () => {
  const { events, settings } = useEventStore();

  useEffect(() => {
    if (!settings.alarmEnabled) return;

    // 브라우저 알람 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 1분마다 알람 확인
    const interval = setInterval(() => {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const now = dayjs();
      const currentDate = now.format('YYYY-MM-DD');

      events.forEach(event => {
        // 오늘 날짜 일정만 확인
        if (event.date !== currentDate) return;

        // 알람 활성화 + 시간 설정 + alarm > 0 인 경우만 처리
        if (!event.alarmEnabled) return;
        if (!event.useTime) return;
        if (!event.alarm || event.alarm <= 0) return;
        if (!event.startTime) return;

        const eventTime = dayjs(`${event.date} ${event.startTime}`);
        if (!eventTime.isValid()) return;

        const alarmTime = eventTime.subtract(event.alarm, 'minute');
        const timeDiff = now.diff(alarmTime, 'minute');

        // 알람 시간에서 1분 이내면 알람 표시
        if (timeDiff >= 0 && timeDiff < 1) {
          new Notification('📅 Rara Calendar', {
            body: `${event.title} — ${event.startTime} 시작 (${event.alarm}분 전 알림)`,
            icon: '/favicon.ico',
            tag: event.id, // 중복 알람 방지
          });
        }
      });
    }, 60000); // 1분마다 확인

    return () => clearInterval(interval);
  }, [events, settings.alarmEnabled]);
};
