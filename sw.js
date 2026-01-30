/* Service Worker for FullStack AI Blog */
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = 'fullstack-ai-' + CACHE_VERSION;

// 预缓存资源列表
const urlsToCache = [
  '/',
  '/manifest.json',
  '/archives/',
  '/categories/',
  '/tags/',
  '/css/index.css',
  '/js/main.js',
  '/js/utils.js',
  '/js/search/local-search.js'
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  // CDN 资源 - 缓存优先（7天）
  cdn: {
    pattern: /^https:\/\/cdn\.jsdelivr\.net/,
    strategy: 'cacheFirst',
    cacheName: 'cdn-cache',
    maxAge: 7 * 24 * 60 * 60  // 7天
  },
  // Waline 评论 - 网络优先（1小时）
  waline: {
    pattern: /^https:\/\/waline-eight-lyart\.vercel\.app/,
    strategy: 'networkFirst',
    cacheName: 'waline-cache',
    maxAge: 60 * 60  // 1小时
  },
  // 图片资源 - 缓存优先（30天）
  images: {
    pattern: /\.(?:png|jpg|jpeg|webp|gif|svg|ico)$/,
    strategy: 'cacheFirst',
    cacheName: 'image-cache',
    maxAge: 30 * 24 * 60 * 60  // 30天
  },
  // 字体资源 - 缓存优先（30天）
  fonts: {
    pattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
    strategy: 'cacheFirst',
    cacheName: 'font-cache',
    maxAge: 30 * 24 * 60 * 60
  },
  // API 请求 - 网络优先
  api: {
    pattern: /\/api\//,
    strategy: 'networkFirst',
    cacheName: 'api-cache',
    maxAge: 5 * 60  // 5分钟
  }
};

// 安装事件 - 预缓存核心资源
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching core resources');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => {
            console.warn('[SW] Some resources failed to cache:', err);
            // 即使部分资源失败，继续安装
            return Promise.resolve();
          });
      })
      .then(() => {
        // 立即激活新的 Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // 删除旧版本缓存
            if (cacheName !== CACHE_NAME && cacheName.startsWith('fullstack-ai-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 立即控制所有页面
        return self.clients.claim();
      })
  );
});

// 获取匹配的缓存策略
function getCacheStrategy(request) {
  const url = new URL(request.url);

  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(url.href) || config.pattern.test(url.pathname)) {
      return config;
    }
  }
  return null;
}

// 缓存优先策略
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // 检查缓存是否过期
    const dateHeader = cached.headers.get('date');
    if (dateHeader) {
      const cacheDate = new Date(dateHeader);
      const now = new Date();
      const age = (now - cacheDate) / 1000;

      if (age < maxAge) {
        return cached;
      }
    }
  }

  try {
    const network = await fetch(request);
    if (network && network.status === 200) {
      cache.put(request, network.clone());
    }
    return network;
  } catch (error) {
    // 网络失败，返回过期缓存（如果有）
    if (cached) {
      console.log('[SW] Using stale cache for:', request.url);
      return cached;
    }
    throw error;
  }
}

// 网络优先策略
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const network = await fetch(request);
    if (network && network.status === 200) {
      cache.put(request, network.clone());
    }
    return network;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// 拦截网络请求
self.addEventListener('fetch', event => {
  const { request } = event;

  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 不处理非 HTTP(S) 请求
  if (!request.url.startsWith('http')) {
    return;
  }

  // 检查是否匹配特定缓存策略
  const strategy = getCacheStrategy(request);

  if (strategy) {
    event.respondWith(
      strategy.strategy === 'cacheFirst'
        ? cacheFirst(request, strategy.cacheName, strategy.maxAge)
        : networkFirst(request, strategy.cacheName, strategy.maxAge)
    );
    return;
  }

  // 默认策略：网络优先，失败时返回缓存
  event.respondWith(
    caches.match(request)
      .then(cached => {
        const fetchPromise = fetch(request)
          .then(network => {
            if (network && network.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, network.clone());
              });
            }
            return network;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
      .catch(() => {
        // 所有尝试都失败，返回离线页面
        return caches.match('/offline.html');
      })
  );
});

// 消息监听 - 用于手动控制缓存
self.addEventListener('message', event => {
  const { data } = event;

  if (!data) return;

  switch (data.type) {
    case 'SKIP_WAITING':
      // 跳过等待，立即激活
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      // 缓存指定 URL
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(data.urls))
      );
      break;

    case 'CLEAR_CACHE':
      // 清除所有缓存
      event.waitUntil(
        caches.keys()
          .then(cacheNames => Promise.all(
            cacheNames.map(name => caches.delete(name))
          ))
      );
      break;

    case 'GET_VERSION':
      // 返回当前版本
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
  }
);

// 后台同步（可选）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-comments') {
    event.waitUntil(
      // 同步评论的逻辑
      console.log('[SW] Syncing comments...')
    );
  }
});

// 推送通知（可选）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '您有新消息',
    icon: '/img/web-app-manifest-192x192.png',
    badge: '/img/favicon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FullStack AI', options)
  );
});

console.log('[SW] Service Worker loaded:', CACHE_VERSION);
