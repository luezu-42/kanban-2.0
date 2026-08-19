export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function errorMessage(error: unknown, fallback: string) {
  if (isOffline()) {
    return "You are offline. Changes stay on this device until you reconnect.";
  }
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (/unauthorized|unlock|password|401/i.test(raw)) {
    return "Session expired. Unlock the workspace again.";
  }
  if (
    /failed to fetch|networkerror|load failed|network|timeout|aborterror/i.test(
      raw,
    )
  ) {
    return "Could not reach the workspace. Check your connection and try again.";
  }
  if (/quota|exceeded/i.test(raw)) {
    return "This device is out of storage for a local copy.";
  }
  return fallback;
}

export const SYNC_RETRY_EVENT = "ledger-sync-retry";

export function requestSyncRetry() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SYNC_RETRY_EVENT));
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
