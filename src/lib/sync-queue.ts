const DB_NAME = "ledger-outbox";
const STORE = "items";
const KEY = "workspace";
const SYNC_TAG = "ledger-workspace";
const PERIODIC_TAG = "ledger-pull";

export type WorkspaceSyncPayload = {
  token: string;
  themes: unknown;
  activeThemeId: string;
  at: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueWorkspaceSync(
  payload: Omit<WorkspaceSyncPayload, "at">,
) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...payload, at: Date.now() }, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  await requestBackgroundSync();
}

export async function readWorkspaceSync() {
  const db = await openDb();
  const row = await new Promise<WorkspaceSyncPayload | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result as WorkspaceSyncPayload | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return row ?? null;
}

export async function clearWorkspaceSync() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function requestBackgroundSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const sync = (
      registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }
    ).sync;
    if (sync) {
      await sync.register(SYNC_TAG);
      return;
    }
  } catch {
    // Background Sync is optional; the online listener is the fallback.
  }
}

export async function registerPeriodicSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const periodic = (
      registration as ServiceWorkerRegistration & {
        periodicSync?: {
          register: (tag: string, options: { minInterval: number }) => Promise<void>;
        };
      }
    ).periodicSync;
    if (!periodic) return;
    const status = await navigator.permissions.query({
      name: "periodic-background-sync" as PermissionName,
    });
    if (status.state !== "granted") return;
    await periodic.register(PERIODIC_TAG, { minInterval: 15 * 60 * 1000 });
  } catch {
    // Periodic sync is Chromium-only and permission-gated.
  }
}

export async function replayWorkspaceSync(payload: WorkspaceSyncPayload) {
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
  await clearWorkspaceSync();
}

export function subscribeSyncMessages(onFlush: () => void, onPull: () => void) {
  if (typeof navigator === "undefined" || !navigator.serviceWorker) {
    return () => {};
  }
  const onMessage = (event: MessageEvent) => {
    const type = (event.data as { type?: string } | null)?.type;
    if (type === "ledger-flush") onFlush();
    if (type === "ledger-pull") onPull();
  };
  navigator.serviceWorker.addEventListener("message", onMessage);
  const onOnline = () => onFlush();
  window.addEventListener("online", onOnline);
  return () => {
    navigator.serviceWorker.removeEventListener("message", onMessage);
    window.removeEventListener("online", onOnline);
  };
}

export async function registerLedgerWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await registerPeriodicSync();
  } catch {
    // Preview without SW support should keep working.
  }
}
