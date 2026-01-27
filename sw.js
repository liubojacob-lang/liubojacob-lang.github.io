/* Service Worker for FullStack AI Blog */
const CACHE_NAME = 'fullstack-ai-v1.0.0';
const urlsToCache = [
  '/',
  '/archives/',
  '/categories/',
  '/tags/',
  '/css/index.css',
  '/js/main.js',
  '/js/utils.js',
  '/js/search/local-search.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(err => console.error('[SW] Cache install failed:', err))
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response;
        }

        // 缓存未命中，请求网络
        return fetch(event.request).then(response => {
          // 检查是否为有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          // 添加到缓存
          caches.open(CACHE_NAME)
            .then(cache => {
              // 只缓存成功的 GET 请求
              if (event.request.method === 'GET' &&
                  event.request.url.startsWith('http')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // 网络请求失败，返回离线页面
        return caches.match('/offline.html');
      })
  );
});

// 消息监听（用于更新缓存）
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
