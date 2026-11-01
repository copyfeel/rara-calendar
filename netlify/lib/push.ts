import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

// Netlify 함수 공통: Firebase Admin + Web Push 초기화와 사용자별 푸시 발송
//
// 필요한 환경변수 (Netlify 사이트 설정):
//   FIREBASE_CLIENT_EMAIL                         — Firebase 서비스 계정 이메일
//   FIREBASE_PRIVATE_KEY_BASE64 (또는 FIREBASE_PRIVATE_KEY) — 서비스 계정 비공개 키
//     (CLI가 '-----BEGIN'을 옵션으로 오인하지 않도록 base64로 저장)
//   FIREBASE_PROJECT_ID (없으면 VITE_FIREBASE_PROJECT_ID 사용)
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY           — Web Push 키

const VAPID_SUBJECT = 'https://rara-todo-calendar.netlify.app';

const requireEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`환경변수 ${name}이(가) 설정되지 않았습니다`);
  return value;
};

const getPrivateKey = (): string => {
  const encoded = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (encoded) return Buffer.from(encoded, 'base64').toString('utf8');
  // 환경변수에 저장하면서 줄바꿈이 \n 문자로 바뀐 경우 복원
  return requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
};

let initialized = false;

const init = () => {
  if (initialized) return;

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: requireEnv('FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
        clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
        privateKey: getPrivateKey(),
      }),
    });
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    requireEnv('VAPID_PUBLIC_KEY'),
    requireEnv('VAPID_PRIVATE_KEY')
  );

  initialized = true;
};

export const getDb = () => {
  init();
  return getFirestore();
};

export const getAdminAuth = () => {
  init();
  return getAuth();
};

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  enabled?: boolean;
}

// 사용자의 활성 구독 기기 전체에 발송. 만료된 구독(404/410)은 삭제한다.
export const sendToUser = async (uid: string, payload: PushPayload) => {
  const db = getDb();
  const snapshot = await db
    .collection(`users/${uid}/pushSubscriptions`)
    .where('enabled', '==', true)
    .get();

  let sent = 0;
  let failed = 0;

  await Promise.all(
    snapshot.docs.map(async (subDoc) => {
      const sub = subDoc.data() as StoredSubscription;
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload),
          { TTL: 60 * 60, urgency: 'high' }
        );
        sent++;
      } catch (error) {
        failed++;
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await subDoc.ref.delete();
          console.log(`만료된 구독 삭제: users/${uid}/pushSubscriptions/${subDoc.id}`);
        } else {
          console.error(`푸시 발송 실패 (users/${uid}, ${subDoc.id}):`, statusCode, error);
        }
      }
    })
  );

  return { sent, failed };
};

// ── 알림 문구 ─────────────────────────────────────
const ALARM_LABELS: Record<number, string> = {
  10080: '1주일 전',
  4320: '3일 전',
  2880: '2일 전',
  1440: '1일 전',
  180: '3시간 전',
  120: '2시간 전',
  60: '1시간 전',
  30: '30분 전',
};

// 앱(utils/alarm.ts showAlarmNotification)과 같은 형식
export const formatAlarmBody = (event: {
  title: string;
  date: string;
  startTime: string;
  alarm: number;
}) => {
  const [, month, day] = event.date.split('-').map(Number);
  const label = ALARM_LABELS[event.alarm] ?? `${event.alarm}분 전`;
  return `${event.title} — ${month}월 ${day}일 ${event.startTime} 시작 (${label} 알림)`;
};
