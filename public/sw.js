
const CACHE_NAME = "alnabigha-pwa-v2";
const STATIC_CACHE = "alnabigha-static-v2";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn("تعذر حفظ:", url);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) =>
            key.startsWith("alnabigha-") &&
            key !== CACHE_NAME &&
            key !== STATIC_CACHE
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // لا نخزن طلبات Firebase أو الخدمات الخارجية
  if (url.origin !== self.location.origin) return;

  // صفحات المنصة: الشبكة أولاً، ثم النسخة المحفوظة
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/", response.clone());
          }
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request) ||
            await caches.match("/") ||
            new Response(
              "لا يوجد اتصال بالإنترنت. افتح المنصة بعد الاتصال بالإنترنت مرة واحدة لحفظ ملفاتها.",
              {
                headers: { "Content-Type": "text/plain; charset=utf-8" }
              }
            )
          );
        })
    );
    return;
  }

  // حفظ ملفات JavaScript وCSS والصور والخطوط
  const isAppAsset = [
    "script",
    "style",
    "image",
    "font",
    "worker"
  ].includes(request.destination);

  if (isAppAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const saved = await cache.match(request);

        if (saved) return saved;

        try {
          const response = await fetch(request);

          if (response.ok && response.type === "basic") {
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          return new Response("", { status: 503 });
        }
      })()
    );
  }
});
