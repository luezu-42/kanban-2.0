export const UNLOCK_KEY = "ledger-unlock-token";

function readStore(store: Storage | undefined) {
  if (!store) return "";
  try {
    return store.getItem(UNLOCK_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStore(store: Storage | undefined, token: string) {
  if (!store) return;
  try {
    if (token) store.setItem(UNLOCK_KEY, token);
    else store.removeItem(UNLOCK_KEY);
  } catch {
    // Storage can be blocked in private contexts.
  }
}

export function getUnlockToken() {
  if (typeof window === "undefined") return "";
  const local = readStore(window.localStorage);
  if (local) return local;
  const session = readStore(window.sessionStorage);
  if (session) {
    writeStore(window.localStorage, session);
    return session;
  }
  return "";
}

export function setUnlockToken(token: string) {
  if (typeof window === "undefined") return;
  writeStore(window.localStorage, token);
  writeStore(window.sessionStorage, token);
}

export function clearUnlockToken() {
  if (typeof window === "undefined") return;
  writeStore(window.localStorage, "");
  writeStore(window.sessionStorage, "");
}
