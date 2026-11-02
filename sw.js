/* CourtConnect service worker — offline-first cache */
const CACHE = "courtconnect-v4";
const CORE = [
  "./",
  "./index.html",
  "./district-courts.html",
  "./high-court.html",
  "./supreme-court.html",
  "./education.html",
  "./bare-acts.html",
  "./landmark-judgments.html",
  "./judicial-exams.html",
  "./videos.html",
  "./drafting.html",
  "./judgments-orders.html",
  "./download.html",
  "./admin.html",
  "./manifest.webmanifest",
  "./assets/css/styles.css",
  "./assets/js/data.js",
  "./assets/js/main.js",
  "./assets/js/admin.js",
  "./assets/js/drafts-catalog.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
