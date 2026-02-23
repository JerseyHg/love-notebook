const CACHE_NAME = "love-notebook-v2";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // 只缓存静态资源（JS/CSS/图片/字体）
    if (
        request.method !== "GET" ||
        request.url.includes("/api/") ||
        request.mode === "navigate"
    ) {
        return;
    }

    // 静态资源：缓存优先
    if (request.url.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
    }
});