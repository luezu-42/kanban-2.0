import { useSyncExternalStore } from "react";
import { ASSET_PREFIX } from "@/lib/whiteboard";

const memory = new Map<string, string>();
const listeners = new Set<() => void>();
let generation = 0;

const DB_NAME = "ledger-assets";
const STORE = "blobs";

function emit() {
  generation += 1;
  for (const listener of listeners) listener();
}

export function subscribeAssets(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAssetGeneration() {
  return generation;
}

export function assetIdFromSrc(src: string) {
  if (src.startsWith(ASSET_PREFIX)) return src.slice(ASSET_PREFIX.length);
  return null;
}

export function resolveAsset(src: string) {
  const id = assetIdFromSrc(src);
  if (!id) return src;
  return memory.get(id) ?? src;
}

export function useAssetGeneration() {
  return useSyncExternalStore(subscribeAssets, getAssetGeneration, () => 0);
}

export function useResolvedSrc(src: string) {
  useAssetGeneration();
  return resolveAsset(src);
}

export function rememberAssets(rows: Array<{ id: string; data: string }>) {
  let changed = false;
  for (const row of rows) {
    if (!row.id || !row.data) continue;
    if (memory.get(row.id) === row.data) continue;
    memory.set(row.id, row.data);
    changed = true;
  }
  if (changed) emit();
}

function openDb(): Promise<IDBDatabase> {
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

async function readIdb(ids: string[]) {
  if (typeof indexedDB === "undefined" || !ids.length) return [] as Array<{ id: string; data: string }>;
  try {
    const db = await openDb();
    const rows = await new Promise<Array<{ id: string; data: string }>>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const found: Array<{ id: string; data: string }> = [];
      let pending = ids.length;
      if (!pending) {
        resolve(found);
        return;
      }
      for (const id of ids) {
        const get = store.get(id);
        get.onsuccess = () => {
          const value = get.result;
          if (typeof value === "string" && value) found.push({ id, data: value });
          pending -= 1;
          if (pending === 0) resolve(found);
        };
        get.onerror = () => reject(get.error);
      }
    });
    db.close();
    return rows;
  } catch {
    return [];
  }
}

async function writeIdb(rows: Array<{ id: string; data: string }>) {
  if (typeof indexedDB === "undefined" || !rows.length) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      for (const row of rows) store.put(row.data, row.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Quota is non-fatal; memory cache still serves the tab.
  }
}

export async function fetchAssetRows(ids: string[], token: string) {
  const rows: Array<{ id: string; data: string }> = [];
  for (const id of ids) {
    try {
      const response = await fetch(`/api/assets/${encodeURIComponent(id)}`, {
        headers: { "x-ledger-unlock": token },
      });
      if (!response.ok) continue;
      const blob = await response.blob();
      const data = await blobToDataUrl(blob);
      if (data.startsWith("data:image/")) rows.push({ id, data });
    } catch {
      // A missing asset is non-fatal; the card still renders without it.
    }
  }
  return rows;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(blob);
  });
}

export async function ensureAssets(
  ids: string[],
  loadMissing: (ids: string[]) => Promise<Array<{ id: string; data: string }>>,
) {
  const unique = [...new Set(ids.filter(Boolean))];
  const missing = unique.filter((id) => !memory.has(id));
  if (!missing.length) return;

  const cached = await readIdb(missing);
  if (cached.length) rememberAssets(cached);
  const still = missing.filter((id) => !memory.has(id));
  if (!still.length) return;

  const remote = await loadMissing(still);
  if (!remote.length) return;
  rememberAssets(remote);
  void writeIdb(remote);
}

export function collectAssetIdsFromThemes(
  themes: Array<{
    cards: Record<string, { images: Record<string, string> }>;
    whiteboard?: {
      format?: string;
      files?: Record<string, { src?: string }>;
      nodes?: Array<{ type: string; src?: string }>;
    };
  }>,
) {
  const ids: string[] = [];
  for (const theme of themes) {
    for (const card of Object.values(theme.cards)) {
      for (const src of Object.values(card.images)) {
        const id = assetIdFromSrc(src);
        if (id) ids.push(id);
      }
    }
    const board = theme.whiteboard;
    for (const file of Object.values(board?.files ?? {})) {
      if (typeof file.src !== "string") continue;
      const id = assetIdFromSrc(file.src);
      if (id) ids.push(id);
    }
    for (const node of board?.nodes ?? []) {
      if (node.type !== "image" || typeof node.src !== "string") continue;
      const id = assetIdFromSrc(node.src);
      if (id) ids.push(id);
    }
  }
  return ids;
}
