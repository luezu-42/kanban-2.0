import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestSyncRetry } from "@/lib/errors";
import { useSyncStatus } from "@/lib/sync-status";

export function SyncBanner() {
  const health = useSyncStatus((state) => state.health);
  const message = useSyncStatus((state) => state.message);

  if (health === "ok") return null;

  const offline = health === "offline";
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-urgent/12 px-3 py-2.5 text-urgent shadow-border"
    >
      <p className="flex min-w-0 items-start gap-2 text-sm leading-snug">
        <WifiOff className="mt-0.5 size-4 shrink-0" />
        <span>
          {message ||
            (offline
              ? "You are offline. Edits stay on this device."
              : "Could not save to the workspace.")}
        </span>
      </p>
      {offline ? null : (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => requestSyncRetry()}
        >
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
