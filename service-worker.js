// service-worker.js

const CACHE_NAME = 'quiz-app-cache-v2'; // キャッシュの名前を更新して新しいService Workerのインストールを促す
// GitHub Pagesのサブディレクトリに対応するため、urlsToCacheのパスを相対パスで記述
const urlsToCache = [
  './', // index.html がルートの場合のパス
  './index.html',
  './styles.css',
  './main.js',
  './pastResults.js',
  './questionList.js',
  './questions.js',
  './quiz.js',
  './textbookContent.js',
  './utils.js',
  './manifest.json',
  // アイコンファイルもキャッシュ対象に含める（パスを相対パスで指定）
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
  // 必要に応じて他のアセット（画像など）も追加
];

// インストールイベント: キャッシュを開いて必要なアセットを追加
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント: リクエストをインターセプトし、キャッシュから応答するか、ネットワークから取得する
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにレスポンスがあればそれを使う
        if (response) {
          return response;
        }
        // なければネットワークから取得する
        return fetch(event.request).then(
          (response) => {
            // レスポンスが不正な場合（HTTPエラー、Opaqueレスポンスなど）はキャッシュしない
            // Opaqueレスポンスは、クロスオリジンリクエストでCORSポリシーに違反した場合に発生し、
            // そのレスポンスをキャッシュすることはできません。
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに入れる
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

// アクティベートイベント: 古いキャッシュをクリアする
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 現在のキャッシュ名と一致しないキャッシュを削除
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
