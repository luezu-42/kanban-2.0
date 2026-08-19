export const UNLOCK_KEY = "ledger-unlock-token";

export function getUnlockToken() {
  if (typeof sessionStorage === "undefined") return "";
  return sessionStorage.getItem(UNLOCK_KEY) ?? "";
}

export function setUnlockToken(token: string) {
  sessionStorage.setItem(UNLOCK_KEY, token);
}

export function clearUnlockToken() {
  sessionStorage.removeItem(UNLOCK_KEY);
}
