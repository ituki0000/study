const CACHE_NAME = 'schedule-app-v1';
const API_CACHE_NAME = 'schedule-api-v1';
const STATIC_CACHE_NAME = 'schedule-static-v1';

// キャッシュするリソース
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API エンドポイント
const API_ENDPOINTS = [
  '/api/schedules',
  '/api/templates',
  '/api/schedules/analytics'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker インストール中...');
  
  event.waitUntil(
    Promise.all([
      // 静的リソースをキャッシュ
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('🗂️ 静的リソースをキャッシュしています...');
        return cache.addAll(STATIC_RESOURCES.filter(resource => {
          // 存在しないリソースをフィルタリング
          return true; // 実際の実装では、リソースの存在確認を行う
        }));
      }).catch(error => {
        console.warn('⚠️ 一部の静的リソースのキャッシュに失敗しました:', error);
        // エラーが発生しても続行
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('✅ Service Worker インストール完了');
      // 古いService Workerを即座に置き換える
      return self.skipWaiting();
    })
  );
});

// Service Worker アクティベーション
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker アクティベート中...');
  
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ 古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 全てのクライアントを制御下に置く
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker アクティベート完了');
    })
  );
});

// フェッチイベント（ネットワークリクエストの処理）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // APIリクエストの処理
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(event.request));
    return;
  }
  
  // 静的リソースの処理
  if (event.request.method === 'GET') {
    event.respondWith(handleStaticRequest(event.request));
    return;
  }
});

// APIリクエストの処理（Network First戦略）
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // まずネットワークから取得を試みる
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功した場合は結果をキャッシュ
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('🌐 APIレスポンスをキャッシュしました:', url.pathname);
      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}`);
    }
  } catch (error) {
    console.log('📡 ネットワークエラー、キャッシュから取得を試みます:', url.pathname);
    
    // ネットワークが失敗した場合はキャッシュから取得
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('💾 キャッシュからAPIレスポンスを返します:', url.pathname);
      return cachedResponse;
    }
    
    // キャッシュにもない場合はオフライン用のレスポンスを返す
    if (url.pathname === '/api/schedules') {
      return new Response(JSON.stringify({
        data: [],
        total: 0,
        offline: true,
        message: 'オフラインモードです。ネットワーク接続を確認してください。'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// 静的リソースの処理（Cache First戦略）
async function handleStaticRequest(request) {
  try {
    // まずキャッシュから取得を試みる
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('💾 キャッシュから静的リソースを返します:', request.url);
      return cachedResponse;
    }
    
    // キャッシュにない場合はネットワークから取得
    console.log('🌐 ネットワークから静的リソースを取得:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功した場合はキャッシュに保存
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ 静的リソースの取得に失敗:', request.url, error);
    
    // HTMLファイルの場合はオフライン用ページを返す
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>オフライン - 予定管理システム</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background-color: #f5f5f5;
            }
            .offline-message { 
              text-align: center; 
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="icon">📱</div>
            <h1>オフラインモード</h1>
            <p>インターネット接続を確認してください</p>
            <button onclick="window.location.reload()" 
                    style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              再試行
            </button>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('🔄 バックグラウンド同期:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    console.log('🔄 バックグラウンド同期を実行中...');
    // ここで保留中のデータをサーバーに同期
    // 実装は将来の拡張で追加
    console.log('✅ バックグラウンド同期完了');
  } catch (error) {
    console.error('❌ バックグラウンド同期エラー:', error);
  }
}

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('📬 プッシュ通知受信:', event);
  
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '確認',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('予定管理システム', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 通知がクリックされました:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🚀 Service Worker 読み込み完了'); 