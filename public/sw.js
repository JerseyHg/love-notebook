/// <reference lib="webworker" />

const CACHE_NAME = "love-notebook-v1";

// 需要预缓存的静态资源
const PRECACHE_URLS = ["/timeline", "/diary", "/map", "/wishlist", "/anniversary"];

// 安装：预缓存核心页面
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// 激活：清除旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求策略：网络优先，失败用缓存
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // API 请求不缓存
  if (request.url.includes("/api/")) return;

  // 非 GET 不缓存
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 成功响应放入缓存
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // 离线时用缓存
        return caches.match(request);
      })
  );
});
