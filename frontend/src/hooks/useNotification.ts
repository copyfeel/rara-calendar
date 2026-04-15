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
      if (Notification.permission !== 'granted') return;

      const now = dayjs();
      const currentDate = now.format('YYYY-MM-DD');

      events.forEach(event => {
        if (event.date !== currentDate) return;

        // 알람 시간 계산
        const eventTime = dayjs(`${event.date} ${event.startTime}`);
        const alarmTime = eventTime.subtract(event.alarm, 'minute');
        const timeDiff = now.diff(alarmTime, 'minute');

        // 알람 시간에서 1분 이내면 알람 표시
        if (timeDiff >= 0 && timeDiff < 1) {
          new Notification('📅 Rara Calendar', {
            body: `${event.title} - ${event.startTime} 시작`,
            icon: '/favicon.ico',
            tag: event.id, // 중복 알람 방지
          });
        }
      });
    }, 60000); // 1분마다 확인

    return () => clearInterval(interval);
  }, [events, settings.alarmEnabled]);
};
