// 캐시 버전을 올리면 activate 단계에서 이전 캐시가 삭제된다
const CACHE_NAME = 'rara-calendar-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Service Worker 설치 (새 버전은 대기 없이 바로 적용)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 이전 버전 캐시 정리 후 열린 페이지에 바로 적용
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// 백그라운드에서 일정 업데이트 (Push 알림)
self.addEventListener('push', event => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification('Rara Calendar', options)
  );
});

// 알림 클릭 처리: 열려 있는 앱 창이 있으면 그 창으로, 없으면 새로 연다
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 네트워크 요청 처리 (오프라인 지원)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Firebase 등 외부 요청은 서비스워커가 관여하지 않는다
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 페이지(index.html)는 네트워크 우선: 새 배포가 바로 보이도록 하고, 오프라인이면 캐시 사용
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', responseToCache));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 그 외 정적 파일은 캐시 우선 (assets 파일명에 해시가 있어 안전)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(response => {
        // 동적 캐싱
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
