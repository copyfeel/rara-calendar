import { formatAlarmBody, getDb, sendToUser } from '../lib/push';

// 1분마다 실행: 알람 시각이 된 일정을 찾아 구독 기기로 푸시 발송
// (앱 utils/alarm.ts 의 ALARM_CATCH_UP_MINUTES 와 같은 값)
const CATCH_UP_MINUTES = 10;

export default async () => {
  const db = getDb();
  const now = new Date();
  const from = new Date(now.getTime() - CATCH_UP_MINUTES * 60 * 1000);

  // users/{uid} 문서가 없어도 하위 컬렉션이 있으면 목록에 포함된다
  const userRefs = await db.collection('users').listDocuments();
  let alarms = 0;
  let sent = 0;

  for (const userRef of userRefs) {
    // 구독 기기가 없는 사용자는 일정 조회를 건너뜀
    const subs = await userRef.collection('pushSubscriptions').where('enabled', '==', true).limit(1).get();
    if (subs.empty) continue;

    const due = await userRef
      .collection('events')
      .where('alarmAt', '>=', from.toISOString())
      .where('alarmAt', '<=', now.toISOString())
      .get();

    for (const eventDoc of due.docs) {
      const event = eventDoc.data();
      if (event.alarmSent === true || event.alarmEnabled !== true) continue;

      // 중복 발송 방지를 위해 먼저 발송 완료로 표시
      await eventDoc.ref.update({ alarmSent: true });
      alarms++;

      const result = await sendToUser(userRef.id, {
        title: '📅 Rara Calendar',
        body: formatAlarmBody({
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          alarm: event.alarm,
        }),
        tag: eventDoc.id,
        url: '/',
      });
      sent += result.sent;
    }
  }

  console.log(`send-alarms: 사용자 ${userRefs.length}명 확인, 알람 ${alarms}건, 푸시 ${sent}건 발송`);
  return new Response(JSON.stringify({ alarms, sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  schedule: '* * * * *',
};
