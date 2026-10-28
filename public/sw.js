// Minimal service worker so browsers treat Covenant as an installable PWA.
// Network-only on purpose: the demo reads live local state, so no stale shell is cached.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});
