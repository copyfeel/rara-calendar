import { useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import dayjs from 'dayjs';
import {
  ALARM_CATCH_UP_MINUTES,
  getAlarmTime,
  isAlarmFired,
  markAlarmFired,
  showAlarmNotification,
} from '../utils/alarm';

const CHECK_INTERVAL_MS = 30 * 1000;

export const useNotification = () => {
  const { events, settings } = useEventStore();

  useEffect(() => {
    if (!settings.alarmEnabled) return;

    const checkAlarms = () => {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const now = dayjs();

      events.forEach(event => {
        // 날짜와 관계없이 실제 알람 시각으로 판단 (1주일 전·1일 전 알람 포함)
        const alarmTime = getAlarmTime(event);
        if (!alarmTime) return;

        const minutesLate = now.diff(alarmTime, 'minute', true);
        // 아직 시각 전이거나, 너무 오래 지나 놓친 알람은 건너뜀
        if (minutesLate < 0 || minutesLate > ALARM_CATCH_UP_MINUTES) return;
        if (isAlarmFired(event.id, alarmTime)) return;

        markAlarmFired(event.id, alarmTime);
        showAlarmNotification(event);
      });
    };

    // 앱을 열거나 다시 화면에 돌아왔을 때 바로 확인 (백그라운드 탭은 타이머가 지연됨)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkAlarms();
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkAlarms);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkAlarms);
    };
  }, [events, settings.alarmEnabled]);
};
