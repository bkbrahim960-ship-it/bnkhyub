// BNKhub Service Worker
const CACHE_NAME = 'bnkhub-cache-v2';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activated');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'BNKhub', body: 'Nouveau contenu disponible !' };
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
