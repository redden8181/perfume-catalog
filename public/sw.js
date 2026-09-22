/*
 * Ароматека — Service Worker.
 *
 * Стратегия:
 *  - Навигация (HTML): network-first с принудительной ревалидацией.
 *    После каждого деплоя на GitHub Pages приложение на телефоне
 *    обновляется само при следующем открытии (при наличии сети).
 *  - Остальные GET-ресурсы (иконки, фото, манифест): cache-first,
 *    при промахе — сеть с сохранением в кэш.
 *  - Офлайн: всё отдаётся из кэша.
 */

const CACHE_NAME = "aromateka-v1";
const INDEX_KEY = "aromateka-index";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Чистим устаревшие кэши предыдущих версий
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML-навигация: network-first → свежая версия после каждого деплоя
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const fresh = await fetch(new Request(req, { cache: "no-cache" }));
          if (fresh.ok) await cache.put(INDEX_KEY, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(INDEX_KEY);
          if (cached) return cached;
          const fallback = await cache.match(req);
          return fallback || Response.error();
        }
      })()
    );
    return;
  }

  // Статика: cache-first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) await cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
