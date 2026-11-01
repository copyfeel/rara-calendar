import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// 서버 푸시(Web Push) 구독 관리
// 구독 정보는 users/{uid}/pushSubscriptions/{deviceId} 에 저장되고,
// Netlify 예약 함수(send-alarms)가 이를 읽어 알람 시각에 푸시를 보낸다.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
const DEVICE_STORAGE_KEY = 'raraCalendarPushDeviceId';
const SUBSCRIPTIONS_COLLECTION = 'pushSubscriptions';

export type PushSupport = 'supported' | 'ios-needs-home-screen' | 'unsupported';

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const getPushSupport = (): PushSupport => {
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (hasApis && VAPID_PUBLIC_KEY) return 'supported';
  // 아이폰 Safari 탭에서는 PushManager가 없다 (홈 화면에 추가한 앱에서만 가능, iOS 16.4+)
  if (isIOS() && !isStandalone()) return 'ios-needs-home-screen';
  return 'unsupported';
};

// 이 기기에서 서버 푸시를 받고 있는지 (useNotification이 앱 알람 중복을 피하는 데 사용)
export const isPushActiveOnThisDevice = (): boolean => {
  try {
    return !!localStorage.getItem(DEVICE_STORAGE_KEY);
  } catch {
    return false;
  }
};

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

// 구독 endpoint로 기기 ID 생성 (같은 기기는 같은 문서를 덮어씀)
const getDeviceId = async (endpoint: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(hash).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
};

const subscriptionRef = (uid: string, deviceId: string) =>
  doc(db, `users/${uid}/${SUBSCRIPTIONS_COLLECTION}`, deviceId);

// 반드시 버튼 클릭 안에서 호출 (iOS는 사용자 동작 없이 권한 요청 불가)
export const subscribePush = async (uid: string): Promise<void> => {
  if (getPushSupport() !== 'supported' || !VAPID_PUBLIC_KEY) {
    throw new Error('unsupported');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission-denied');

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = subscription.toJSON();
  const deviceId = await getDeviceId(subscription.endpoint);
  const now = new Date().toISOString();

  await setDoc(subscriptionRef(uid, deviceId), {
    endpoint: subscription.endpoint,
    keys: json.keys ?? {},
    enabled: true,
    userAgent: navigator.userAgent,
    createdAt: now,
    updatedAt: now,
  });

  localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
};

export const unsubscribePush = async (uid: string): Promise<void> => {
  const deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  localStorage.removeItem(DEVICE_STORAGE_KEY);

  if (deviceId) {
    await deleteDoc(subscriptionRef(uid, deviceId)).catch((err) =>
      console.error('Error deleting push subscription:', err)
    );
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    await subscription?.unsubscribe();
  }
};

// 관리자 화면 알람 on/off를 이 기기의 서버 푸시에도 반영
export const setPushEnabled = async (uid: string, enabled: boolean): Promise<void> => {
  const deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!deviceId) return;
  await updateDoc(subscriptionRef(uid, deviceId), {
    enabled,
    updatedAt: new Date().toISOString(),
  });
};

// 테스트 푸시 발송 요청 (Netlify 함수 send-test)
export const sendTestPush = async (): Promise<{ sent: number; failed: number }> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('not-logged-in');

  const response = await fetch('/.netlify/functions/send-test', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`send-test failed: ${response.status}`);
  return response.json();
};
