import { getAdminAuth, sendToUser } from '../lib/push';

// 관리자 화면 '테스트 알림 보내기': 로그인한 본인의 구독 기기로 테스트 푸시 발송
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await sendToUser(uid, {
      title: '📅 Rara Calendar',
      body: '테스트 알림입니다 ✅ 앱이 꺼져 있어도 이렇게 알림이 옵니다',
      tag: 'rara-test',
      url: '/',
    });
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-test 실패:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
