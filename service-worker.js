// Solar Energy Intelligence - PWA Service Worker

const CACHE_NAME = "solar-energy-intelligence-v5";

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/weather/sunny.json",
  "./assets/weather/clear-night.json",
  "./assets/weather/partly-cloudy.json",
  "./assets/weather/cloudy.json",
  "./assets/weather/fog.json",
  "./assets/weather/rain.json",
  "./assets/weather/snow.json",
  "./assets/weather/thunderstorms-rain.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urls = LOCAL_ASSETS.map(
        (path) => new URL(path, self.registration.scope).href
      );

      await Promise.allSettled(
        urls.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });

            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn("PWA precache skipped:", url, error);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Weather/API/CDN requests stay network-based.
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          return caches.match(
            new URL("./index.html", self.registration.scope).href
          );
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response.ok) {
                return caches.open(CACHE_NAME).then((cache) =>
                  cache.put(request, response.clone())
                );
              }
            })
            .catch(() => undefined)
        );

        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
