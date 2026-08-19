const VERSION = "ledger-sw-v1";
const DB_NAME = "ledger-outbox";
const STORE = "items";
const KEY = "workspace";
const SYNC_TAG = "ledger-workspace";
const PERIODIC_TAG = "ledger-pull";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(["/favicon.svg"])).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) event.waitUntil(flushWorkspace());
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === PERIODIC_TAG) event.waitUntil(notifyClients("ledger-pull"));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ledger-flush-now") event.waitUntil(flushWorkspace());
});

function shouldBypass(pathname) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/__grok/") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/node_modules") ||
    pathname.includes("_server") ||
    pathname.includes("sw.js")
  );
}

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match("/");
    if (fallback) return fallback;
    throw new Error("offline");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}

async function notifyClients(type) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of windows) client.postMessage({ type });
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readOutbox() {
  const db = await openDb();
  const row = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const get = tx.objectStore(STORE).get(KEY);
    get.onsuccess = () => resolve(get.result ?? null);
    get.onerror = () => reject(get.error);
  });
  db.close();
  return row;
}

async function clearOutbox() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function flushWorkspace() {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  if (windows.length) {
    for (const client of windows) client.postMessage({ type: "ledger-flush" });
    return;
  }
  const payload = await readOutbox();
  if (!payload) return;
  const response = await fetch("/api/workspace-sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      token: payload.token,
      themes: payload.themes,
      activeThemeId: payload.activeThemeId,
    }),
  });
  if (!response.ok) throw new Error("workspace sync failed");
  await clearOutbox();
}
