// Repo Sentinel service worker: works offline with the last data it saw.
// The data file is encrypted, so keeping a copy on the device reveals nothing.
const VERSION = "sentinel-v2";
const SCOPE = self.registration.scope; // e.g. https://user.github.io/repo-sentinel/
const SHELL = [SCOPE, `${SCOPE}manifest.webmanifest`, `${SCOPE}icons/icon.svg`, `${SCOPE}icons/icon-192.png`, `${SCOPE}icons/icon-512.png`];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? cache.match(SCOPE) : Response.error());
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || !url.href.startsWith(SCOPE)) return;
  // Hashed build files never change: cache first. Pages and data: network first.
  e.respondWith(url.pathname.includes("/_astro/") || url.pathname.includes("/icons/") ? cacheFirst(e.request) : networkFirst(e.request));
});
